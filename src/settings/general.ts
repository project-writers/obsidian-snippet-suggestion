import { Setting } from "obsidian";
import SnippetsSuggestionPlugin from "../main";
import { DEFAULT_SETTINGS } from "../data";
import { getNow } from "../util";

function addRenderCodeCliptextLineNumber(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
	new Setting(container)
		.setName("클립보드 텍스트 줄 수 표기")
		.setDesc(
			"붙여넣기시 제안화면에 표시되는 클립보드 텍스트에 총 라인수를 표기합니다",
		)
		.addToggle((component) => {
			component
				.setValue(plugin.settings.hasCliptextLineNumber)
				.onChange(async (value) => {
					plugin.settings.hasCliptextLineNumber = value;
					await plugin.saveSettings();
					display();
				});
		});
}

function addRenderCodeMaxLine(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
) {
	new Setting(container)
		.setName("최대 줄 수")
		.setDesc(
			"자동완성 제안화면에 표시되는 코드영역의 최대 줄 수를 제한합니다",
		)
		.addSlider((slider) => {
			slider
				.setLimits(1, 10, 1) // 최소값, 최대값, 단계
				.setValue(plugin.settings.maxLines)
				.setDynamicTooltip()
				.onChange(async (value) => {
					plugin.settings.maxLines = value;
					await plugin.saveSettings();
				});
		});
}

function addTriggerSetting(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
) {
	new Setting(container)
		.setName("트리거 문자")
		.setDesc("자동완성을 트리거할 문자를 지정합니다")
		.addText((component) => {
			component
				.setValue(plugin.settings.trigger)
				.onChange(async (value) => {
					plugin.settings.trigger = value;
					await plugin.saveSettings();
				});
		});
}

function addDateFormatSetting(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
) {
	new Setting(container)
		.setName("날짜 포멧")
		.setDesc(
			`YYYY: ${getNow("YYYY")}, YY: ${getNow("YY")}, MM: ${getNow(
				"MM",
			)}, DD: ${getNow("DD")}, ddd: ${getNow("ddd")}`,
		)
		.addText((component) => {
			component
				.setValue(plugin.settings.dayFormat)
				.onChange(async (value) => {
					plugin.settings.dayFormat = value;
					await plugin.saveSettings();
				});
		});
}

function addTimeFormatSetting(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
) {
	new Setting(container)
		.setName("시간 포멧")
		.setDesc(
			`a: ${getNow("a")}, hh: ${getNow("hh")}, mm: ${getNow(
				"mm",
			)}, ss: ${getNow("ss")}`,
		)
		.addText((component) => {
			component
				.setValue(plugin.settings.nowFormat)
				.onChange(async (value) => {
					plugin.settings.nowFormat = value;
					await plugin.saveSettings();
				});
		});
}

function addHistorySettings(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
	new Setting(container)
		.setName("검색어 우선추천")
		.setDesc("검색했던 내용을 우선추천 합니다")
		.addToggle((component) => {
			component
				.setValue(plugin.settings.hasHistory)
				.onChange(async (value) => {
					plugin.settings.hasHistory = value;
					await plugin.saveSettings();
					display();
				});
		});
	if (plugin.settings.hasHistory) {
		new Setting(container)
			.setName("저장할 기록 수")
			.setClass("SS-sub-setting")
			.addText((cb) => {
				cb.setPlaceholder(String(DEFAULT_SETTINGS.lenthOfHistory))
					.setValue(String(plugin.settings.lenthOfHistory))
					.onChange(async (value) => {
						plugin.settings.lenthOfHistory =
							value !== ""
								? Number(value)
								: DEFAULT_SETTINGS.lenthOfHistory;
						await plugin.saveSettings();
					});
			});

		new Setting(container)
			.setName("기록 제거하기")
			.setClass("SS-sub-setting")
			.addButton((cb) => {
				cb.setButtonText("제거").onClick(async () => {
					plugin.settings.history = [];
					await plugin.saveSettings();
				});
			});
	}
}

export function addGeneralSettingsTo(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
	addTriggerSetting(container, plugin);
	addRenderCodeCliptextLineNumber(container, plugin, display);
	addRenderCodeMaxLine(container, plugin);
	addDateFormatSetting(container, plugin);
	addTimeFormatSetting(container, plugin);
	addHistorySettings(container, plugin, display);
}
