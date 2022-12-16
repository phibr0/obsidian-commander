import { injectIcons, removeStyles, updateMacroCommands, updateStyles } from "src/util";
import { updateSpacing } from "src/util";
import { Command, Plugin } from "obsidian";
import { DEFAULT_SETTINGS } from "./constants";
import t from "./l10n";
import {
	EditorMenuCommandManager,
	ExplorerManager,
	FileMenuCommandManager,
	PageHeaderManager,
	RibbonManager,
	StatusBarManager,
} from "./manager/commands";
import { Action, CommanderSettings } from "./types";
import CommanderSettingTab from "./ui/settingTab";
import SettingTabModal from "./ui/settingTabModal";

import "./styles/styles.scss";
import "./styles/advanced-toolbar.scss";
import { updateHiderStylesheet } from "./util";
import registerCustomIcons from "./ui/icons";
import LeftRibbonManager from "./manager/commands/leftRibbonManager";

export default class CommanderPlugin extends Plugin {
	public settings: CommanderSettings;
	public manager: {
		editorMenu: EditorMenuCommandManager;
		fileMenu: FileMenuCommandManager;
		leftRibbon: LeftRibbonManager;
		//rightRibbon: RibbonManager,
		//titleBar: TitleBarManager,
		statusBar: StatusBarManager;
		pageHeader: PageHeaderManager;
		explorerManager: ExplorerManager;
	};

	public async executeStartupMacros(): Promise<void> {
		const ref = setTimeout(() => {
			this.settings.macros.forEach(async (macro, idx) => {
				if (macro.startup) {
					await this.executeMacro(idx);
				}
			});
		}, 1000);
		this.register(() => clearTimeout(ref));
	}

	public async executeMacro(id: number): Promise<void> {
		const macro = this.settings.macros[id];
		if (!macro) throw new Error("Macro not found");

		for (const command of macro.macro) {
			switch (command.action) {
				case Action.COMMAND: {
					await app.commands.executeCommandById(command.commandId);
					continue;
				}
				case Action.DELAY: {
					await new Promise((resolve) =>
						setTimeout(resolve, command.delay)
					);
					continue;
				}
				case Action.EDITOR: {
					continue;
				}
				case Action.LOOP: {
					for (let i = 0; i < command.times; i++) {
						await app.commands.executeCommandById(
							command.commandId
						);
					}
					continue;
				}
			}
		}
	}

	public async onload(): Promise<void> {
		await this.loadSettings();
		delete this.settings.hide.leftRibbon;

		registerCustomIcons();

		this.manager = {
			editorMenu: new EditorMenuCommandManager(
				this,
				this.settings.editorMenu
			),
			fileMenu: new FileMenuCommandManager(this, this.settings.fileMenu),
			leftRibbon: new LeftRibbonManager(this),
			//rightRibbon: new RibbonManager("right", this),
			//titleBar: new TitleBarManager(this, this.settings.titleBar),
			statusBar: new StatusBarManager(this, this.settings.statusBar),
			pageHeader: new PageHeaderManager(this, this.settings.pageHeader),
			explorerManager: new ExplorerManager(this, this.settings.explorer),
		};

		this.addSettingTab(new CommanderSettingTab(this));

		this.addCommand({
			name: t("Open Commander Settings"),
			id: "open-commander-settings",
			callback: () => new SettingTabModal(this).open(),
		});

		this.registerEvent(
			app.workspace.on(
				"editor-menu",
				this.manager.editorMenu.applyEditorMenuCommands(this)
			)
		);

		this.registerEvent(
			app.workspace.on(
				"file-menu",
				this.manager.fileMenu.applyFileMenuCommands(this)
			)
		);

		app.workspace.onLayoutReady(() => {
			updateHiderStylesheet(this.settings);
			updateMacroCommands(this);
			updateSpacing(this.settings.spacing);
			updateStyles(this.settings.advancedToolbar);
			injectIcons(this.settings.advancedToolbar);

			this.executeStartupMacros();
		});
	}

	public onunload(): void {
		document.head.querySelector("style#cmdr")?.remove();
		removeStyles();
	}

	private async loadSettings(): Promise<void> {
		const data = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.settings = data;
	}

	public async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	public listActiveToolbarCommands(): string[] {
		//@ts-ignore
		const activeCommands = this.app.vault.getConfig(
			"mobileToolbarCommands"
		);
		return activeCommands;
	}

	public getCommands(): Command[] {
		const commands: Command[] = [];
		this.listActiveToolbarCommands().forEach((id) => {
			//@ts-ignore
			const c = this.app.commands.commands[id];
			if (c) commands.push(c);
		});
		return commands;
	}

	public getCommandsWithoutIcons(includeSelfAdded = true): Command[] {
		const commands: Command[] = [];
		this.getCommands().forEach((c) => {
			if (c && !c.icon) {
				commands.push(c);
			}
		});
		if (includeSelfAdded) {
			this.getCommands().forEach((c) => {
				if (
					this.settings.advancedToolbar.mappedIcons.find(
						(m) => m.commandID === c.id
					)
				) {
					commands.push(c);
				}
			});
		}
		return commands;
	}
}
