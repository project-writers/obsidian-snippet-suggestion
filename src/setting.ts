import { PluginSettingTab } from "obsidian";
import SnippetsSuggestionPlugin from "./main";
import { addCommandSettingsTo } from "./settings/command";
import { addGeneralSettingsTo } from "./settings/general";
import { addSnippetSettingsTo } from "./settings/snippet";

export class SettingView extends PluginSettingTab {
	constructor(public plugin: SnippetsSuggestionPlugin) {
		super(plugin.app, plugin);
	}

	display() {
		const container = this.containerEl;
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

		addSnippetSettingsTo(container, this.plugin, () => this.display());
		addCommandSettingsTo(container, this.plugin, this.app, () =>
			this.display(),
		);
		addGeneralSettingsTo(container, this.plugin, () => this.display());
	}
}
