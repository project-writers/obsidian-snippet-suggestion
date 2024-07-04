export type GroupColor = string;
export type SnippetSymbols = {
	queryEscapeSymbol: string;
	cursorSymbol: string;
	pasteSymbol: string;
	daySymbol: string;
	nowSymbol: string;
};
export type SettingsData = {
	symbols: SnippetSymbols;
	dayFormat: string;
	nowFormat: string;
	hasHistory: boolean;
	lenthOfHistory: number;
	trigger: string;
	maxLines: number;
	history: string[];
	snippets: SnippetsValues[];
	commands: CommandValues[];
};

export type CommandValues = {
	name: string;
	commandId: string;
	desc: string;
	check: boolean;
};
export type SnippetsValues = {
	name: string;
	code: string;
	desc: string;
	check: boolean;
};
export const DEFAULT_SETTINGS: SettingsData = {
	symbols: {
		queryEscapeSymbol: "`",
		cursorSymbol: "$cursor$",
		pasteSymbol: "$pst$",
		daySymbol: "$today$",
		nowSymbol: "$now$",
	},
	hasHistory: true,
	lenthOfHistory: 10,
	history: [],
	trigger: "/",
	maxLines: 3,
	dayFormat: "YY.MM.DD ddd",
	nowFormat: "a hh:mm",
	commands: [],
	snippets: [
		{
			name: "as",
			code: "{$pst$}$cursor$",
			desc: "arrow-start",
			check: true,
		},
		{
			name: "ae",
			code: "{$pst$|red|diagonal}$cursor$",
			desc: "arrow-end",
			check: true,
		},
		{
			name: "day",
			code: "$today$",
			desc: "today",
			check: true,
		},
		{
			name: "now",
			code: "$now$",
			desc: "now",
			check: true,
		},
		{
			name: "cn",
			code: "> [!note] $cursor$\n> \n> $pst$",
			desc: "callout name",
			check: true,
		},
		{
			name: "cc ",
			code: "> [!note] name\n> $cursor$\n> $pst$",
			desc: "callout content",
			check: true,
		},
		{
			name: "cur",
			code: "inline $cursor$ test",
			desc: "time",
			check: true,
		},
		{
			name: "pst",
			code: "hello \n> $cursor$ $pst$",
			desc: "clipboard",
			check: true,
		},
	],
};

interface InternalPlugin {
	enabled: boolean;
}

interface InternalPlugins {
	"slash-command": InternalPlugin;
}
declare module "obsidian" {
	interface App {
		commands: {
			commands: {
				[id: string]: Command;
			};
			executeCommandById: (id: string) => void;
		};
		plugins: {
			manifests: {
				[id: string]: PluginManifest;
			};
		};
		internalPlugins: {
			plugins: InternalPlugins;
			getPluginById<T extends keyof InternalPlugins>(
				id: T,
			): InternalPlugins[T];
		};
		statusBar: {
			containerEl: HTMLElement;
		};
		appId: string;
		isMobile: boolean;
		setting: {
			closeActiveTab: () => void;
			openTabById: (id: string) => void;
			activeTab: {
				containerEl: HTMLElement;
			};
		};
	}
}
