import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from './constants';
import CommanderSettingTab from './ui/settingTab';
import { CommanderSettings, Macro } from './types';
import { EditorMenuCommandManager, FileMenuCommandManager } from './manager/menuManager';
import SettingTabModal from './ui/settingTabModal';
import RibbonManager from './manager/ribbonManager';
import TitleBarManager from './manager/titleBarManager';
import StatusBarManager from './manager/statusBarManager';
import PageHeaderManager from './manager/pageHeaderManager';
import MacroModal from './ui/macroModal';

import "./styles.scss";
import 'beautiful-react-diagrams/styles.css';

export default class CommanderPlugin extends Plugin {
	public settings: CommanderSettings;
	public manager: {
		editorMenu: EditorMenuCommandManager,
		fileMenu: FileMenuCommandManager,
		leftRibbon: RibbonManager,
		rightRibbon: RibbonManager,
		titleBar: TitleBarManager,
		statusBar: StatusBarManager,
		pageHeader: PageHeaderManager,
	};

	public async onload(): Promise<void> {
		await this.loadSettings();

		this.addSettingTab(new CommanderSettingTab(this));

		this.addCommand({
			name: "Open Commander Settings",
			id: "open-commander-settings",
			callback: () => new SettingTabModal(this).open(),
		});

		this.addCommand({
			name: "Open Macro Builder",
			id: "open-macro-builder",
			callback: () => new MacroModal(this).open(),
		});

		this.manager = {
			editorMenu: new EditorMenuCommandManager(this, this.settings.editorMenu),
			fileMenu: new FileMenuCommandManager(this, this.settings.fileMenu),
			leftRibbon: new RibbonManager("left", this),
			rightRibbon: new RibbonManager("right", this),
			titleBar: new TitleBarManager(this, this.settings.titleBar),
			statusBar: new StatusBarManager(this, this.settings.statusBar),
			pageHeader: new PageHeaderManager(this, this.settings.pageHeader),
		};

		this.registerEvent(
			app.workspace.on('editor-menu', this.manager.editorMenu.applyEditorMenuCommands(this)),
		);

		this.registerEvent(
			app.workspace.on('file-menu', this.manager.fileMenu.applyFileMenuCommands(this)),
		);
	}

	// Macros become quite large objects, because we are saving the whole flowchart state (including position, etc.)
	// This is why they are encoded into a single line base64 string to save space
	private async loadSettings(): Promise<void> {
		const data = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		data.macros = data.macros.map((str: string) => JSON.parse(window.atob(str)));
		this.settings = data;
	}

	public async saveSettings(): Promise<void> {
		const data = Object.assign({}, this.settings);
		data.macros = data.macros.map((obj: Macro) => window.btoa(JSON.stringify(obj)));
		await this.saveData(data);
	}
}
