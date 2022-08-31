import { updateSpacing } from 'src/util';
import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from './constants';
import t from './l10n';
import {
	EditorMenuCommandManager,
	FileMenuCommandManager,
	PageHeaderManager,
	RibbonManager,
	StatusBarManager,
} from "./manager/commands";
import { CommanderSettings, Macro } from './types';
import CommanderSettingTab from './ui/settingTab';
import SettingTabModal from './ui/settingTabModal';

//import 'beautiful-react-diagrams/styles.css';
import "./styles.scss";
import { updateHiderStylesheet } from './util';
import registerCustomIcons from './ui/icons';

export default class CommanderPlugin extends Plugin {
	public settings: CommanderSettings;
	public manager: {
		editorMenu: EditorMenuCommandManager,
		fileMenu: FileMenuCommandManager,
		leftRibbon: RibbonManager,
		//rightRibbon: RibbonManager,
		//titleBar: TitleBarManager,
		statusBar: StatusBarManager,
		pageHeader: PageHeaderManager,
	};

	public async onload(): Promise<void> {
		await this.loadSettings();

		registerCustomIcons();
		updateSpacing(this.settings.spacing);

		this.manager = {
			editorMenu: new EditorMenuCommandManager(this, this.settings.editorMenu),
			fileMenu: new FileMenuCommandManager(this, this.settings.fileMenu),
			leftRibbon: new RibbonManager("left", this),
			//rightRibbon: new RibbonManager("right", this),
			//titleBar: new TitleBarManager(this, this.settings.titleBar),
			statusBar: new StatusBarManager(this, this.settings.statusBar),
			pageHeader: new PageHeaderManager(this, this.settings.pageHeader),
		};

		this.addSettingTab(new CommanderSettingTab(this));

		this.addCommand({
			name: t("Open Commander Settings"),
			id: "open-commander-settings",
			callback: () => new SettingTabModal(this).open(),
		});

		// this.addCommand({
		// 	name: t("Open Macro Builder"),
		// 	id: "open-macro-builder",
		// 	callback: () => new MacroModal(this).open(),
		// });

		this.registerEvent(
			app.workspace.on('editor-menu', this.manager.editorMenu.applyEditorMenuCommands(this)),
		);

		this.registerEvent(
			app.workspace.on('file-menu', this.manager.fileMenu.applyFileMenuCommands(this)),
		);

		updateHiderStylesheet(this.settings);
	}

	public onunload(): void {
		document.head.querySelector("style#cmdr")?.remove();
	}

	// Macros become quite large objects, because we are saving the whole flowchart state (including position, etc.)
	// This is why they are encoded into a single line base64 string to save space (wip)
	private async loadSettings(): Promise<void> {
		const data = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		data.macros = data.macros.map((str: string) => JSON.parse(window.atob(str)));
		this.settings = data;
	}

	public async saveSettings(): Promise<void> {
		const data = Object.assign({}, this.settings);
		// @ts-expect-error: We are assigning the base64 Version of the stringified macro object to the macros attribute
		data.macros = data.macros.map((obj: Macro) => window.btoa(JSON.stringify(obj)));
		await this.saveData(data);
	}
}
