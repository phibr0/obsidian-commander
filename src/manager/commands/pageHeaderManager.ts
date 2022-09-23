import { Menu, setIcon, WorkspaceLeaf } from "obsidian";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ChooseCustomNameModal from "src/ui/chooseCustomNameModal";
import ChooseIconModal from "src/ui/chooseIconModal";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { chooseNewCommand, isModeActive } from "src/util";
import CommandManagerBase from "./commandManager";

export default class PageHeaderManager extends CommandManagerBase {
	private addBtn = createDiv({ cls: "cmdr view-action cmdr-adder", attr: { "aria-label": t("Add new") } });

	public constructor(plugin: CommanderPlugin, pairArray: CommandIconPair[]) {
		super(plugin, pairArray);
		this.init();
	}

	private getButtonIcon(
		name: string,
		id: string,
		icon: string,
		iconSize: number,
		classes: string[],
	): HTMLElement {
		const buttonClasses = classes.concat([id]);

		const buttonIcon = createEl('a', {
			cls: buttonClasses,
			attr: { 'aria-label-position': 'bottom', 'aria-label': name },
		});
		setIcon(buttonIcon, icon, iconSize);
		return buttonIcon;
	}

	private addPageHeaderButton(
		viewActions: Element,
		pair: CommandIconPair
	): void {
		const { id, icon, name } = pair;
		const classes = ['view-action', "clickable-icon", "cmdr-page-header"];

		const buttonIcon = this.getButtonIcon(name, id, icon, 16, classes);
		viewActions.prepend(buttonIcon);

		buttonIcon.addEventListener('mouseup', () => {
			/* this way the pane gets activated from the click
				otherwise the action would get executed on the former active pane
				timeout of 1 was enough, but 5 is chosen for slower computers
				may need to be made its own setting in the future
				 */
			setTimeout(() => app.commands.executeCommandById(id), 5);
		});
		buttonIcon.addEventListener("contextmenu", (event) => {
			event.stopImmediatePropagation();
			new Menu()
				.addItem(item => {
					item
						.setTitle(t("Add command"))
						.setIcon("command")
						.onClick(async () => {
							const pair = await chooseNewCommand(this.plugin);
							this.addCommand(pair);
						});
				})
				.addSeparator()
				.addItem(item => {
					item
						.setTitle(t("Change Icon"))
						.setIcon("box")
						.onClick(async () => {
							const newIcon = await (new ChooseIconModal(this.plugin)).awaitSelection();
							if (newIcon && newIcon !== pair.icon) {
								pair.icon = newIcon;
								await this.plugin.saveSettings();
								this.reorder();
							}
						});
				})
				.addItem(item => {
					item
						.setTitle(t("Rename"))
						.setIcon("text-cursor-input")
						.onClick(async () => {
							const newName = await (new ChooseCustomNameModal(pair.name)).awaitSelection();
							if (newName && newName !== pair.name) {
								pair.name = newName;
								await this.plugin.saveSettings();
								this.reorder();
							}
						});
				})
				.addItem(item => {
					item.dom.addClass("is-warning");
					item
						.setTitle(t("Delete"))
						.setIcon("lucide-trash")
						.onClick(async () => {
							if (!this.plugin.settings.confirmDeletion || (await new ConfirmDeleteModal(this.plugin).didChooseRemove())) {
								this.removeCommand(pair);
							}
						});
				})
				.showAtMouseEvent(event);
		});
	}

	private init(): void {
		this.plugin.register(() => {
			// Remove all buttons on plugin unload
			this.pairs.slice().forEach(pair => this.removeButtons(pair));
		});
		this.plugin.registerEvent(app.workspace.on("layout-change", () => {
			this.addButtonsToAllLeaves();
		}));
		this.plugin.registerEvent(app.workspace.on("active-leaf-change", activeLeaf => {
			if (this.plugin.settings.showAddCommand) activeLeaf?.containerEl.getElementsByClassName('view-actions')[0].prepend(this.addBtn);
		}));
		this.plugin.register(() => this.addBtn.remove());
		setIcon(this.addBtn, "plus");
		this.addBtn.onmouseup = async (): Promise<void> => {
			const pair = await chooseNewCommand(this.plugin);
			this.addCommand(pair);
			this.reorder();
		};

		app.workspace.onLayoutReady(() => setTimeout(() => this.addButtonsToAllLeaves(), 100));
	}

	private addButtonsToAllLeaves(): void {
		app.workspace.iterateAllLeaves(leaf => this.addButtonsToLeaf(leaf));
	}

	private addButtonsToLeaf(leaf: WorkspaceLeaf): void {
		const viewActions =
			leaf.containerEl.getElementsByClassName('view-actions')[0];

		if (!viewActions) return;

		for (const pair of this.pairs) {
			if (!viewActions.getElementsByClassName(
				`view-action cmdr-page-header ${pair.id}`
			)[0]) {
				if (isModeActive(pair.mode)) {
					this.addPageHeaderButton(
						viewActions,
						pair
					);
				}
			}
		}
	}

	public reorder(): void | Promise<void> {
		const x = activeDocument.getElementsByClassName("view-action cmdr-page-header");
		for (let i = x.length - 1; i >= 0; i--) {
			x.item(i)?.remove();
		}
		this.addButtonsToAllLeaves();
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.push(pair);
		await this.plugin.saveSettings();
	}

	public removeButtons(pair: CommandIconPair) {
		const x = activeDocument.getElementsByClassName(`view-action cmdr-page-header ${pair.id}`);
		for (let i = x.length - 1; i >= 0; i--) {
			x.item(i)?.remove();
		}
	}

	public async removeCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.remove(pair);
		this.removeButtons(pair);
		await this.plugin.saveSettings();
	}
}
