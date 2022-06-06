import { Command, Editor, MarkdownView, Menu, MenuItem, TAbstractFile, WorkspaceLeaf } from "obsidian";
import CommandManager from "./_commandManager";
import CommanderPlugin from "../main";
import { CommandIconPair } from "../types";
import ConfirmDeleteModal from "../ui/confirmDeleteModal";
import { chooseNewCommand, getCommandFromId } from "../util";

abstract class Base extends CommandManager {
	public async addCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.push(pair);
		await this.plugin.saveSettings();
	}

	public async removeCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.remove(pair);
		await this.plugin.saveSettings();
	}

	// There is no state to update
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public reorder(): void { }

	// eslint-disable-next-line no-unused-vars
	protected addRemovableCommand(this: (item: MenuItem) => void, command: Command, cmdPair: CommandIconPair, plugin: CommanderPlugin, menu: Menu, commandList: CommandIconPair[]): (item: MenuItem) => void {
		return (item: MenuItem) => {
			item.dom.addClass("cmdr");

			let isRemovable = false;
			const setNormal = (): void => {
				item
					.setTitle(cmdPair.name ?? command.name)
					.setIcon(cmdPair.icon)
					.onClick(() => app.commands.executeCommandById(cmdPair.id));
			};
			const setRemovable = (): void => {
				item.setTitle("Delete").setIcon("trash").onClick(async (event) => {
					event.preventDefault();
					event.stopImmediatePropagation();
					if (!plugin.settings.confirmDeletion || (await new ConfirmDeleteModal(plugin).didChooseRemove())) {
						removeMenu();
					}
				});
			};
			const removeMenu = async (): Promise<void> => {
				item.dom.addClass("cmdr-removing");
				menu.registerDomEvent(item.dom, "transitionend", () => {
					item.dom.remove();
				});
				commandList.remove(cmdPair);
				await plugin.saveSettings();
			};

			menu.registerDomEvent(item.dom, "mousemove", (event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
				if (event.shiftKey) {
					if (!isRemovable) setRemovable();
					isRemovable = true;
				}
			});
			menu.registerDomEvent(item.dom, "mouseleave", () => {
				setNormal();
				isRemovable = false;
			});

			setNormal();
		};
	}

	protected addCommandAddButton(plugin: CommanderPlugin, menu: Menu, commandList: CommandIconPair[]): void {
		if (plugin.settings.showAddCommand) {
			menu.addItem((item: MenuItem) => {
				item
					.setTitle("Add command")
					.setIcon("plus-circle")
					.onClick(async () => {
						try {
							const pair = await chooseNewCommand(plugin);
							commandList.push(pair);
							await plugin.saveSettings();
						} catch (error) {
							//Do some proper handling here
							console.log(error);
						}
					});
			});
		}
	}

}

export class EditorMenuCommandManager extends Base {

	public applyEditorMenuCommands(plugin: CommanderPlugin) {
		return async (menu: Menu, editor: Editor, view: MarkdownView): Promise<void> => {
			this.addCommandAddButton(plugin, menu, plugin.settings.editorMenu);

			for (const cmdPair of plugin.settings.editorMenu) {
				const command = getCommandFromId(cmdPair.id);

				//Command has been removed
				if (command === null) {
					plugin.settings.editorMenu.remove(cmdPair);
					await plugin.saveSettings();
					return;
				}
				//Use the check callbacks accordingly
				if ((command.checkCallback && !command.checkCallback(true))
					|| (command.editorCheckCallback && !command.editorCheckCallback(true, editor, view))
				) continue;

				menu.addItem(this.addRemovableCommand.call(this, command, cmdPair, plugin, menu, plugin.settings.editorMenu));
			}
		};
	}
}

export class FileMenuCommandManager extends Base {

	public applyFileMenuCommands(plugin: CommanderPlugin) {
		return async (menu: Menu, _: TAbstractFile, __: string, leaf?: WorkspaceLeaf): Promise<void> => {
			this.addCommandAddButton(plugin, menu, plugin.settings.fileMenu);

			for (const cmdPair of plugin.settings.fileMenu) {
				const command = getCommandFromId(cmdPair.id);

				//Command has been removed
				if (!command) {
					plugin.settings.editorMenu.remove(cmdPair);
					await plugin.saveSettings();
					return;
				}

				//Check for all checkedCallbacks
				if (command.checkCallback && !command.checkCallback(true)) {
					continue;
				} else if (command.editorCallback) {
					if (!(leaf?.view instanceof MarkdownView)) {
						continue;
					}
				} else if (command.editorCheckCallback) {
					if (leaf?.view instanceof MarkdownView) {
						if (!command.editorCheckCallback(true, leaf.view.editor, leaf.view)) {
							continue;
						}
					} else {
						continue;
					}
				}

				menu.addItem(this.addRemovableCommand.call(this, command, cmdPair, plugin, menu, plugin.settings.fileMenu));
			}
		};
	}

}
