import { App, Setting } from "obsidian";
import SnippetsSuggestionPlugin from "../main";
import { trash } from "../icons";

function addCommandInfoSetting(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
	const headerRaw = new Setting(container);
	headerRaw.setClass("custom-snippet");
	headerRaw.infoEl.addClass("custom-snippet-info");
	headerRaw.infoEl.createDiv({ text: "shortcommand" }).style.width = "50%";
	headerRaw.infoEl.createDiv({ text: "description" }).style.width = "50%";
	headerRaw.controlEl.addClass("custom-snippet-content");

	headerRaw.controlEl.createDiv({ text: "command" });

	const commands = headerRaw.controlEl.createEl("button", {
		text: "+ command",
	});
	commands.addEventListener("click", () => {
		plugin.settings.commands.push({
			name: "test",
			desc: "basic snippet",
			commandId: "",
			check: true,
		});
		plugin.saveSettings();
		display();
	});
}

function addCommandSettings(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	app: App,
	display: () => void,
) {
	const s = plugin.settings;
	const c = app.commands.commands;
	s.commands.sort((a, b) => a.name.localeCompare(b.name));

	for (const o of s.commands) {
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
			const beforeName = o.name;
			const afterName = target.value;
			o.name = afterName;
			// history 에서 이름 변경
			const index = s.history.indexOf(beforeName);
			if (index >= 0) s.history[index] = afterName;
			plugin.saveSettings();
		});

		shortcode.addEventListener("blur", () => {
			display();
		});

		shortcode.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				display();
			}
		});

		// Description
		const description = setting.infoEl.createEl("input", {
			type: "text",
			value: o.desc,
		});
		description.addEventListener("input", (e) => {
			const target = e.target as HTMLInputElement;
			o.desc = target.value;
			plugin.saveSettings();
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
			const selectedCommandName = (e.target as HTMLInputElement).value;
			o.commandId = selectedCommandName;
			plugin.saveSettings();
		});

		// Delete
		const deleteButton = setting.controlEl.createEl("button");
		deleteButton.innerHTML = trash;
		deleteButton.addClass("custom-snippet-trash");
		deleteButton.addEventListener("click", () => {
			s.commands = s.commands.filter((o2) => o2.name !== o.name);
			s.history = s.history.filter((name) => name !== o.name);
			plugin.saveSettings();
			display();
		});

		// Toggle
		setting.addToggle((comp) => {
			comp.setValue(o.check).onChange(async (value) => {
				o.check = value;
				await plugin.saveSettings();
				display();
			});
		});
	}
}

export function addCommandSettingsTo(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	app: App,
	display: () => void,
) {
	addCommandInfoSetting(container, plugin, display);
	addCommandSettings(container, plugin, app, display);
}
