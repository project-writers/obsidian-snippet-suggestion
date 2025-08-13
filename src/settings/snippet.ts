import { Setting } from "obsidian";
import SnippetsSuggestionPlugin from "../main";
import { trash } from "../icons";

function addSnippetInfoSetting(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
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
		plugin.settings.snippets.push({
			name: "test",
			desc: "basic snippet",
			code: "$pst$ $cursor$ $nl$",
			check: true,
		});
		plugin.saveSettings();
		display();
	});
}

function addSnippetSettings(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
	const s = plugin.settings;
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
			plugin.saveSettings();
		});

		// Description
		const description = setting.infoEl.createEl("input", {
			type: "text",
			value: o.desc,
		});
		description.addEventListener("input", (e) => {
			const target = e.target as HTMLInputElement;
			s.snippets[i].desc = target.value;
			plugin.saveSettings();
		});

		// Code
		const code = setting.controlEl.createEl("div");
		code.addClass("custom-snippet-code");
		code.setAttr("contenteditable", true);
		code.innerText = o.code;
		code.addEventListener("input", () => {
			s.snippets[i].code = code.innerText;
			plugin.saveSettings();
		});

		// Delete
		const deleteButton = setting.controlEl.createEl("button");
		deleteButton.innerHTML = trash;
		deleteButton.addClass("custom-snippet-trash");
		deleteButton.addEventListener("click", () => {
			s.snippets = s.snippets.filter((o2) => o2.name !== o.name);
			s.history = s.history.filter((name) => name !== o.name);
			plugin.saveSettings();
			display();
		});

		// Toggle
		setting.addToggle((comp) => {
			comp.setValue(o.check).onChange(async (value) => {
				s.snippets[i].check = value;
				await plugin.saveSettings();
				display();
			});
		});
	}
}

export function addSnippetSettingsTo(
	container: HTMLElement,
	plugin: SnippetsSuggestionPlugin,
	display: () => void,
) {
	addSnippetInfoSetting(container, plugin, display);
	addSnippetSettings(container, plugin, display);
}
