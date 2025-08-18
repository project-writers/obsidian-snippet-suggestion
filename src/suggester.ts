import {
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	Notice,
	TFile,
} from "obsidian";
import SnippetsSuggestionPlugin from "./main";
import { getNow } from "./util";
import Fuse from "fuse.js";
import { CommandValues, SnippetsValues } from "./data";
import * as Hangul from "hangul-js";

export class Suggester extends EditorSuggest<string> {
	private currentContext: EditorSuggestContext | null = null;
	private cliptext: string;
	private fuseResults: import("fuse.js").FuseResult<
		SnippetsValues | CommandValues
	>[] = [];
	constructor(public plugin: SnippetsSuggestionPlugin) {
		super(plugin.app);
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		_: TFile,
	): EditorSuggestTriggerInfo | null {
		// 트리거 문자부터 커서위치까지 입력값 찾아내기
		const sub = editor.getLine(cursor.line).substring(0, cursor.ch);
		const regex = new RegExp(`${this.plugin.settings.trigger}(?:\\S+)?$`);
		const match = sub.match(regex)?.[0];
		if (match) {
			return {
				end: cursor,
				start: {
					ch: sub.lastIndexOf(match),
					line: cursor.line,
				},
				query: match,
			};
		}
		return null;
	}

	getSuggestions(context: EditorSuggestContext): string[] {
		this.currentContext = context;
		// 위에서 찾아낸 쿼리문 가지고 스니펫 필터링
		let query = context.query
			.replace(this.plugin.settings.trigger, "")
			.toLowerCase();
		if (query.length === 0) {
			this.fuseResults = [];
			return [
				...this.plugin.settings.snippets,
				...this.plugin.settings.commands,
			]
				.filter((o) => o.check)
				.map((o) => o.id);
		}
		// 한글변환
		query = this.hangul2roman(query);

		const options = {
			includeMatches: true,
			keys: [
				"name", // 스니펫 이름 검색
				"desc", // 스니펫 설명 검색
			],
			threshold: 0.4,
		};

		const fuse = new Fuse(
			[
				...this.plugin.settings.snippets,
				...this.plugin.settings.commands,
			],
			options,
		);
		const results = fuse.search(query.replace(/`/g, ""));
		this.fuseResults = results;
		return results.map((result) => result.item.id);
	}
	highlight(text: string, indices: readonly [number, number][]) {
		let result = "";
		let lastIndex = 0;
		for (const [start, end] of indices) {
			result += text.substring(lastIndex, start);
			result += `<span class="highlight">${text.substring(
				start,
				end + 1,
			)}</span>`;
			lastIndex = end + 1;
		}
		result += text.substring(lastIndex);
		return result;
	}
	async renderSuggestion(suggestionId: string, el: HTMLElement) {
		const s = this.plugin.settings;
		const symbols = this.plugin.settings.symbols;
		const outer = el.createDiv({ cls: "SS-suggester-container" });

		const shortcodes = [...s.snippets, ...s.commands];
		const suggestObj = shortcodes.find((o) => o.id === suggestionId);

		if (!suggestObj) return;

		const result = this.fuseResults.find(
			(result) => result.item.id === suggestionId,
		);
		const nameMatch = result?.matches?.find(
			(m: import("fuse.js").FuseResultMatch) => m.key === "name",
		);
		const descMatch = result?.matches?.find(
			(m: import("fuse.js").FuseResultMatch) => m.key === "desc",
		);

		const highlightedName = nameMatch
			? this.highlight(suggestObj.name, nameMatch.indices)
			: suggestObj.name;
		const highlightedDesc = descMatch
			? this.highlight(suggestObj.desc, descMatch.indices)
			: suggestObj.desc;

		outer.createDiv({ cls: "SS-shortcode" }).innerHTML = highlightedName;

		if (this.isSnippetsValues(suggestObj)) {
			const cliptext = await this.readClipboardText();
			let code = suggestObj.code
				.replace(/\n/g, "<br>")
				.replace(
					symbols.cursorSymbol,
					'<span class="SS-cursor">|</span>',
				)
				.replace(symbols.nowSymbol, getNow(s.nowFormat))
				.replace(symbols.daySymbol, getNow(s.dayFormat));

			const lines = code.split("<br>");
			const maxlines = this.plugin.settings.maxLines;
			if (lines.length > maxlines) {
				code = lines.slice(0, maxlines).join("<br>") + "...";
			}

			const text =
				cliptext.length > 10
					? `${cliptext.substring(0, 10)}...`
					: cliptext;
			code = code.replace(
				symbols.pasteSymbol,
				this.plugin.settings.hasCliptextLineNumber
					? `<span class="SS-clip">${text}(${
							cliptext.split("\n").length
					  })</span>`
					: `<span class="SS-clip">${text}</span>`,
			);

			outer.createDiv({ cls: "SS-desc" }).innerHTML = highlightedDesc;
			outer.createDiv({ cls: "SS-code" }).innerHTML = code;
		} else {
			outer.createDiv({ cls: "SS-desc" }).innerHTML = highlightedDesc;
			outer.createDiv({ cls: "SS-code SS-command" }).innerHTML =
				suggestObj.commandId;
		}
	}

	// 여기서 snippets 적용
	selectSuggestion(suggestionId: string): void {
		const s = this.plugin.settings;
		const symbols = s.symbols;
		const queryLength = this.context?.query.length;
		if (!queryLength) {
			new Notice("Error query is empty");
			return;
		}

		const shortcodes: (SnippetsValues | CommandValues)[] = [
			...s.snippets,
			...s.commands,
		];
		const suggestObj = shortcodes.find((o) => o.id === suggestionId);
		if (suggestObj && this.context) {
			if (this.isSnippetsValues(suggestObj)) {
				// 여긴 스니펫 작동
				let replaceCode = suggestObj.code;
				const editor = this.context?.editor as Editor;
				const cursor = editor.getCursor();
				navigator.clipboard.readText().then((cliptext) => {
					this.cliptext = cliptext;
					// 코드 변경하기
					if (replaceCode.includes(symbols.pasteSymbol))
						replaceCode = replaceCode.replace(
							symbols.pasteSymbol,
							cliptext,
						);
					if (replaceCode.includes(symbols.daySymbol))
						replaceCode = replaceCode.replace(
							symbols.daySymbol,
							getNow(s.dayFormat),
						);
					if (replaceCode.includes(symbols.nowSymbol))
						replaceCode = replaceCode.replace(
							symbols.nowSymbol,
							getNow(s.nowFormat),
						);

					// 커서 포지션 변경하기
					const { string, endPosition } = this.calculateCursorEndPos(
						replaceCode,
						cursor,
					);

					// 한줄은 이것만 해도 댐
					editor.replaceRange(
						string,
						this.context!.start,
						this.context!.end,
					);
					// 커서위치변경
					const position = {
						line: cursor.line + endPosition.nlinesCount,
						ch:
							cursor.ch +
							endPosition.position -
							(endPosition.nlinesCount === 0 ? queryLength : 0),
					};
					editor.setCursor(position);
					this.plugin.updateHistory(suggestObj.name);
				});
			} else {
				const commandId = suggestObj.commandId;
				const replaceCode = "";
				const editor = this.context?.editor as Editor;
				editor.replaceRange(
					replaceCode,
					this.context.start,
					this.context.end,
				);
				this.app.commands.executeCommandById(commandId);
			}
		}
	}

	// 줄바꿈처리와 커서위치
	calculateCursorEndPos(str: string, cursor: CodeMirror.Position) {
		const endPosition = { nlinesCount: 0, position: 0 };
		const { cursorSymbol } = this.plugin.settings.symbols;

		// 커서위치 줄 위치 찾기
		let cursorIndex = str.indexOf(cursorSymbol);
		if (cursorIndex === -1) cursorIndex = str.length;
		let newlineIndex = str.substring(0, cursorIndex).lastIndexOf("\n");

		// 포지션 계산
		if (newlineIndex !== -1)
			// 가로길이 - 쿼리길이 = 현재위치
			endPosition.position = cursorIndex - newlineIndex - 1 - cursor.ch;
		else endPosition.position = cursorIndex;
		endPosition.nlinesCount =
			// 커서마크 까지 가서 라인 수 세기
			str.substring(0, cursorIndex).split("\n").length - 1;

		return { string: str.replace(cursorSymbol, ""), endPosition };
	}

	async readClipboardText() {
		this.cliptext = await navigator.clipboard.readText();
		return this.cliptext;
	}

	isSnippetsValues(
		obj: SnippetsValues | CommandValues,
	): obj is SnippetsValues {
		return "code" in obj;
	}

	hangul2roman(str: string) {
		const isKorean = (char: string): boolean => {
			if (char.length === 0) return false;
			const code = char[0].charCodeAt(0);
			return (
				(code >= 0xac00 && code <= 0xd7a3) || // 현대 한글 음절
				(code >= 0x1100 && code <= 0x11ff) || // 옛 한글 자모 (초성, 중성, 종성)
				(code >= 0x3130 && code <= 0x318f) || // 한글 호환 자모
				(code >= 0xa960 && code <= 0xa97f) || // 한글 자모 확장-A
				(code >= 0xd7b0 && code <= 0xd7ff) // 한글 자모 확장-B
			);
		};
		if (!isKorean(str)) return str;

		const KEYs: Record<string, string> = {
			ㅃ: "Q",
			ㅉ: "W",
			ㄸ: "E",
			ㄲ: "R",
			ㅆ: "T",
			ㅒ: "O",
			ㅖ: "P",
			ㅂ: "q",
			ㅈ: "w",
			ㄷ: "e",
			ㄱ: "r",
			ㅅ: "t",
			ㅛ: "y",
			ㅕ: "u",
			ㅑ: "i",
			ㅐ: "o",
			ㅔ: "p",
			ㅁ: "a",
			ㄴ: "s",
			ㅇ: "d",
			ㄹ: "f",
			ㅎ: "g",
			ㅗ: "h",
			ㅓ: "j",
			ㅏ: "k",
			ㅣ: "l",
			ㅋ: "z",
			ㅌ: "x",
			ㅊ: "c",
			ㅍ: "v",
			ㅠ: "b",
			ㅜ: "n",
			ㅡ: "m",
			ㄳ: "rt",
			ㅄ: "qt",
			ㄼ: "fq",
			ㄺ: "fr",
			ㄻ: "fa",
			ㅀ: "fg",
			ㄾ: "fx",
			ㄿ: "fv",
		};
		const kor2eng = (key: string) => {
			const korean = /[ㄱ-ㅎ|ㅏ-ㅣ]/;
			if (korean.test(key)) return KEYs[key];
			return key;
		};
		return Hangul.disassemble(str)
			.map((c) => kor2eng(c))
			.join("");
	}
}
