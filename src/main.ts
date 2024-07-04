import { Notice, Plugin } from "obsidian";
import { SettingView } from "./setting";
import { Suggester } from "./suggester";
import { SettingsData, DEFAULT_SETTINGS } from "./data";

export default class SnippetsSuggestionPlugin extends Plugin {
	settings: SettingsData;
	snippetList: string[];

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new SettingView(this));
		this.registerEditorSuggest(new Suggester(this));

		new Notice("Snippet Suggestion by wis");
	}

	async loadSettings() {
		// Object.assign함수는 마지막 요소를 가장 우선순위에 둠, data.json이 있으면 로드 없으면 디폴트값
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
		this.updateSnippetList();
	}

	async saveSettings() {
		// 이게 data.json 에 상태값을 저장하네
		await this.saveData(this.settings);
		// 저장하고 업데이트하면 데이터 파일과 동기화가 됐다고 보는 듯
		this.updateSnippetList();
	}

	updateSnippetList() {
		// 히스토리 사용여부
		if (this.settings.hasHistory) {
			this.snippetList = [
				...new Set([
					...this.settings.history,
					...[...this.settings.snippets, ...this.settings.commands]
						.filter((o) => o.check)
						.map((o) => o.name),
				]),
			];
		} else {
			this.snippetList = [
				...[...this.settings.snippets, ...this.settings.commands]
					.filter((o) => o.check)
					.map((o) => o.name),
			];
		}
	}

	// 히스토리는 따로 운영해서 검색한거 박아두고 서치리스트에 앞자리에 배치하는 듯
	// 괜찮네
	updateHistory(suggestion: string) {
		if (!this.settings.hasHistory) return;

		const set = new Set([suggestion, ...this.settings.history]);
		const history = [...set].slice(0, this.settings.lenthOfHistory);

		this.settings = Object.assign(this.settings, { history });
		this.saveSettings();
	}

	getCurrentDocName() {
		const activeFile = this.app.workspace.getActiveFile();
		if (activeFile) return activeFile.name;
		return "";
	}
}
