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
			name: "_test",
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
	s.snippets.sort((a, b) => a.name.localeCompare(b.name));

	for (const o of s.snippets) {
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

		// Code
		const code = setting.controlEl.createEl("div");
		code.addClass("custom-snippet-code");
		code.setAttr("contenteditable", true);
		code.innerText = o.code;
		code.addEventListener("input", () => {
			o.code = code.innerText;
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
				o.check = value;
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
