import { Menu, setIcon } from "obsidian";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ChooseCustomNameModal from "src/ui/chooseCustomNameModal";
import ChooseIconModal from "src/ui/chooseIconModal";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { chooseNewCommand } from "src/util";
import CommandManager from "./_commandManager";

export default class PageHeaderManager extends CommandManager {
	private addBtn = createDiv({ cls: "cmdr view-action cmdr-adder", attr: { "aria-label": "Add new" } });

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
		tag: 'a' | 'div' = 'a'
	): HTMLElement {
		const tooltip = name;
		const buttonClasses = classes.concat([id]);

		const buttonIcon = createEl(tag, {
			cls: buttonClasses,
			attr: { 'aria-label-position': 'bottom', 'aria-label': tooltip },
		});
		setIcon(buttonIcon, icon, iconSize);
		return buttonIcon;
	}

	private addPageHeaderButton(
		viewActions: Element,
		pair: CommandIconPair
	): void {
		const { id, icon, name } = pair;
		const classes = ['view-action', "cmdr-page-header"];

		const buttonIcon = this.getButtonIcon(name, id, icon, 16, classes);
		viewActions.prepend(buttonIcon);

		this.plugin.registerDomEvent(buttonIcon, 'click', () => {
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
						.setTitle("Add Command")
						.setIcon("command")
						.onClick(async () => {
							const pair = await chooseNewCommand(this.plugin);
							this.addCommand(pair);
						});
				})
				.addSeparator()
				.addItem(item => {
					item
						.setTitle("Change Icon")
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
						.setTitle("Rename")
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
						.setTitle("Delete")
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
		this.plugin.registerEvent(app.workspace.on("file-open", () => {
			const activeLeaf = document.getElementsByClassName(
				'workspace-leaf mod-active'
			)[0];
			const viewActions =
				activeLeaf.getElementsByClassName('view-actions')[0];

			for (const pair of this.pairs) {
				if (
					!viewActions.getElementsByClassName(
						`view-action cmdr-page-header ${pair.id}`
					)[0]
				) {
					this.addPageHeaderButton(
						viewActions,
						pair
					);
				}
			}

			this.plugin.register(() => this.addBtn.remove());
			setIcon(this.addBtn, "plus");
			this.addBtn.onclick = async (): Promise<void> => {
				const pair = await chooseNewCommand(this.plugin);
				this.addCommand(pair);
				this.reorder();
			};
			if (this.plugin.settings.showAddCommand) viewActions.prepend(this.addBtn);
		}));
	}

	public reorder(): void | Promise<void> {
		const x = document.getElementsByClassName("view-action cmdr-page-header");
		const elements: Element[] = [];
		for (let i = 0; i < x.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			elements.push(x.item(i)!);
		}
		elements.forEach((e) => e.remove());
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.push(pair);
		await this.plugin.saveSettings();
	}

	public async removeCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.remove(pair);
		const x = document.getElementsByClassName(`view-action cmdr-page-header ${pair.id}`);
		const elements: Element[] = [];
		for (let i = 0; i < x.length; i++) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			elements.push(x.item(i)!);
		}
		elements.forEach((e) => e.remove());
		await this.plugin.saveSettings();
	}
}
