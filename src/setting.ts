import { PluginSettingTab, Setting } from "obsidian";
import SnippetsSuggestionPlugin from "./main";
import { DEFAULT_SETTINGS } from "./data";
import { getNow } from "./util";
import { trash } from "./icons";
export class SettingView extends PluginSettingTab {
	constructor(public plugin: SnippetsSuggestionPlugin) {
		super(plugin.app, plugin);
	}

	display() {
		let container = this.containerEl;
		container.empty();
		container.createEl("h1", { text: "스니펫 자동완성" });
		container.createDiv({ cls: "SS-symbol-description" }).innerHTML = `
			shortcode를 작성하는 추천 방법은, 두글자 혹은 세글자로 나눠서 카테고리화 시키는 방법입니다.<br>
			td : time today, tn : time now, as: arrow start, ae : arrow end<br>
			형식으로 작성하면 많은 단축키라도 묶여서 의미론적으로 사용되기에 <br>
			기억에 유리할 뿐만 아니라 머슬메모리로도 활용이 가능합니다.<br>
			26*26가지 이상의 경우의 수를 만들 수 있습니다.<br>
			이 방식은 neovim에디터의 which key의 키맵핑 방식으로 수많은 개발자의 사랑을 받고 있습니다.<br>
			<br>
			동적 변환 심볼은 다음과 같습니다. <br>
			$cursor$: 커서위치,   $pst$: 클립보드 복사,   $now$: 현재시간,   $today$: 오늘 날짜<br> 
			<br>`;

		this.addSnippetInfoSetting(container);
		this.addSnippetSettings(container);
		this.addCommandInfoSetting(container);
		this.addCommandSettings(container);
		this.addTriggerSetting(container);
		this.addRenderCodeCliptextLineNumber(container);
		this.addRenderCodeMaxLine(container);
		this.addDateFormatSetting(container);
		this.addTimeFormatSetting(container);
		this.addHistorySettings(container);
	}

	private addSnippetInfoSetting(container: HTMLElement) {
		const headerRaw = new Setting(container);
		headerRaw.setClass("custom-snippet");
		headerRaw.infoEl.addClass("custom-snippet-info");
		headerRaw.infoEl.createDiv({ text: "shortcode" }).style.width = "50%";
		headerRaw.infoEl.createDiv({ text: "description" }).style.width = "50%";
		headerRaw.controlEl.addClass("custom-snippet-content");

		headerRaw.controlEl.createDiv({ text: "code" });

		const snippets = headerRaw.controlEl.createEl("button", {
			text: "+ snippet",
		});
		snippets.addEventListener("click", () => {
			this.plugin.settings.snippets.push({
				name: "test",
				desc: "basic snippet",
				code: "$pst$ $cursor$ $nl$",
				check: true,
			});
			this.plugin.saveSettings();
			this.display();
		});
	}

	private addCommandInfoSetting(container: HTMLElement) {
		const headerRaw = new Setting(container);
		headerRaw.setClass("custom-snippet");
		headerRaw.infoEl.addClass("custom-snippet-info");
		headerRaw.infoEl.createDiv({ text: "shortcommand" }).style.width =
			"50%";
		headerRaw.infoEl.createDiv({ text: "description" }).style.width = "50%";
		headerRaw.controlEl.addClass("custom-snippet-content");

		headerRaw.controlEl.createDiv({ text: "command" });

		const commands = headerRaw.controlEl.createEl("button", {
			text: "+ command",
		});
		commands.addEventListener("click", () => {
			this.plugin.settings.commands.push({
				name: "test",
				desc: "basic snippet",
				commandId: "",
				check: true,
			});
			this.plugin.saveSettings();
			this.display();
		});
	}
	private addSnippetSettings(container: HTMLElement) {
		const s = this.plugin.settings;
		for (let i = s.snippets.length - 1; i >= 0; i--) {
			const o = s.snippets[i];

			const setting = new Setting(container).setClass("custom-snippet");
			setting.infoEl.addClass("custom-snippet-info");
			setting.controlEl.addClass("custom-snippet-content");

			// shortcode
			const shortcode = setting.infoEl.createEl("input", {
				type: "text",
				value: o.name,
			});
			shortcode.addEventListener("input", (e) => {
				const target = e.target as HTMLInputElement;
				const beforeName = s.snippets[i].name;
				const afterName = target.value;
				s.snippets[i].name = afterName;
				// history 에서 이름 변경
				const index = s.history.indexOf(beforeName);
				if (index >= 0) s.history[index] = afterName;
				this.plugin.saveSettings();
			});

			// Description
			const description = setting.infoEl.createEl("input", {
				type: "text",
				value: o.desc,
			});
			description.addEventListener("input", (e) => {
				const target = e.target as HTMLInputElement;
				s.snippets[i].desc = target.value;
				this.plugin.saveSettings();
			});

			// Code
			const code = setting.controlEl.createEl("div");
			code.addClass("custom-snippet-code");
			code.setAttr("contenteditable", true);
			code.innerText = o.code;
			code.addEventListener("input", () => {
				s.snippets[i].code = code.innerText;
				this.plugin.saveSettings();
			});

			// Delete
			const deleteButton = setting.controlEl.createEl("button");
			deleteButton.innerHTML = trash;
			deleteButton.addClass("custom-snippet-trash");
			deleteButton.addEventListener("click", () => {
				s.snippets = s.snippets.filter((o2) => o2.name !== o.name);
				s.history = s.history.filter((name) => name !== o.name);
				this.plugin.saveSettings();
				this.display();
			});

			// Toggle
			setting.addToggle((comp) => {
				comp.setValue(o.check).onChange(async (value) => {
					s.snippets[i].check = value;
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
	}
	private addCommandSettings(container: HTMLElement) {
		const s = this.plugin.settings;
		const c = this.app.commands.commands;
		for (let i = s.commands.length - 1; i >= 0; i--) {
			const o = s.commands[i];

			const setting = new Setting(container).setClass("custom-snippet");
			setting.infoEl.addClass("custom-snippet-info");
			setting.controlEl.addClass("custom-snippet-content");

			// shortcode
			const shortcode = setting.infoEl.createEl("input", {
				type: "text",
				value: o.name,
			});
			shortcode.addEventListener("input", (e) => {
				const target = e.target as HTMLInputElement;
				const beforeName = s.commands[i].name;
				const afterName = target.value;
				s.commands[i].name = afterName;
				// history 에서 이름 변경
				const index = s.history.indexOf(beforeName);
				if (index >= 0) s.history[index] = afterName;
				this.plugin.saveSettings();
			});

			// Description
			const description = setting.infoEl.createEl("input", {
				type: "text",
				value: o.desc,
			});
			description.addEventListener("input", (e) => {
				const target = e.target as HTMLInputElement;
				s.commands[i].desc = target.value;
				this.plugin.saveSettings();
			});

			// Command
			const commandDropdownWrapper = setting.controlEl.createEl("div");
			commandDropdownWrapper.addClass("custom-snippet-command");

			// 검색 입력 필드 생성
			const commandSearchInput = commandDropdownWrapper.createEl("input");
			commandSearchInput.addClass("custom-snippet-command-input");
			commandSearchInput.setAttr("list", "commandOptions");
			commandSearchInput.setAttr("placeholder", "Search command...");
			commandSearchInput.value = o.commandId || "";

			// datalist 요소 생성
			const commandDataList = commandDropdownWrapper.createEl("datalist");
			commandDataList.id = "commandOptions";

			// 옵션 추가
			Object.keys(c).forEach((k) => {
				const { name, id } = c[k];
				const option = commandDataList.createEl("option");
				option.value = id;
				option.setText(name);
			});

			// 입력 필드 변경 이벤트 처리
			commandSearchInput.addEventListener("input", (e) => {
				const selectedCommandName = (e.target as HTMLInputElement)
					.value;
				s.commands[i].commandId = selectedCommandName;
				this.plugin.saveSettings();
			});

			// Delete
			const deleteButton = setting.controlEl.createEl("button");
			deleteButton.innerHTML = trash;
			deleteButton.addClass("custom-snippet-trash");
			deleteButton.addEventListener("click", () => {
				s.commands = s.commands.filter((o2) => o2.name !== o.name);
				s.history = s.history.filter((name) => name !== o.name);
				this.plugin.saveSettings();
				this.display();
			});

			// Toggle
			setting.addToggle((comp) => {
				comp.setValue(o.check).onChange(async (value) => {
					s.commands[i].check = value;
					await this.plugin.saveSettings();
					this.display();
				});
			});
		}
	}

	private addRenderCodeCliptextLineNumber(container: HTMLElement) {
		new Setting(container)
			.setName("클립보드 텍스트 줄 수 표기")
			.setDesc(
				"붙여넣기시 제안화면에 표시되는 클립보드 텍스트에 총 라인수를 표기합니다",
			)
			.addToggle((component) => {
				component
					.setValue(this.plugin.settings.hasCliptextLineNumber)
					.onChange(async (value) => {
						this.plugin.settings.hasCliptextLineNumber = value;
						await this.plugin.saveSettings();
						this.display();
					});
			});
	}
	private addRenderCodeMaxLine(container: HTMLElement) {
		new Setting(container)
			.setName("최대 줄 수")
			.setDesc(
				"자동완성 제안화면에 표시되는 코드영역의 최대 줄 수를 제한합니다",
			)
			.addSlider((slider) => {
				slider
					.setLimits(1, 10, 1) // 최소값, 최대값, 단계
					.setValue(this.plugin.settings.maxLines)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxLines = value;
						await this.plugin.saveSettings();
					});
			});
	}
	private addTriggerSetting(container: HTMLElement) {
		new Setting(container)
			.setName("트리거 문자")
			.setDesc("자동완성을 트리거할 문자를 지정합니다")
			.addText((component) => {
				component
					.setValue(this.plugin.settings.trigger)
					.onChange(async (value) => {
						this.plugin.settings.trigger = value;
						await this.plugin.saveSettings();
					});
			});
	}

	private addDateFormatSetting(container: HTMLElement) {
		new Setting(container)
			.setName("날짜 포멧")
			.setDesc(
				`YYYY: ${getNow("YYYY")}, YY: ${getNow("YY")}, MM: ${getNow("MM")}, DD: ${getNow("DD")}, ddd: ${getNow("ddd")}`,
			)
			.addText((component) => {
				component
					.setValue(this.plugin.settings.dayFormat)
					.onChange(async (value) => {
						this.plugin.settings.dayFormat = value;
						await this.plugin.saveSettings();
					});
			});
	}

	private addTimeFormatSetting(container: HTMLElement) {
		new Setting(container)
			.setName("시간 포멧")
			.setDesc(
				`a: ${getNow("a")}, hh: ${getNow("hh")}, mm: ${getNow("mm")}, ss: ${getNow("ss")}`,
			)
			.addText((component) => {
				component
					.setValue(this.plugin.settings.nowFormat)
					.onChange(async (value) => {
						this.plugin.settings.nowFormat = value;
						await this.plugin.saveSettings();
					});
			});
	}

	private addHistorySettings(container: HTMLElement) {
		new Setting(container)
			.setName("검색어 우선추천")
			.setDesc("검색했던 내용을 우선추천 합니다")
			.addToggle((component) => {
				component
					.setValue(this.plugin.settings.hasHistory)
					.onChange(async (value) => {
						this.plugin.settings.hasHistory = value;
						await this.plugin.saveSettings();
						this.display();
					});
			});
		if (this.plugin.settings.hasHistory) {
			new Setting(container)
				.setName("저장할 기록 수")
				.setClass("SS-sub-setting")
				.addText((cb) => {
					cb.setPlaceholder(String(DEFAULT_SETTINGS.lenthOfHistory))
						.setValue(String(this.plugin.settings.lenthOfHistory))
						.onChange(async (value) => {
							this.plugin.settings.lenthOfHistory =
								value !== ""
									? Number(value)
									: DEFAULT_SETTINGS.lenthOfHistory;
							await this.plugin.saveSettings();
						});
				});

			new Setting(container)
				.setName("기록 제거하기")
				.setClass("SS-sub-setting")
				.addButton((cb) => {
					cb.setButtonText("제거").onClick(async () => {
						this.plugin.settings.history = [];
						await this.plugin.saveSettings();
					});
				});
		}
	}
}
