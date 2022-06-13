import { Menu, setIcon } from "obsidian";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ChooseCustomNameModal from "src/ui/chooseCustomNameModal";
import ChooseIconModal from "src/ui/chooseIconModal";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { getCommandFromId, chooseNewCommand } from "src/util";
import CommandManager from "./_commandManager";

export default class StatusBarManager extends CommandManager {
	private container: HTMLElement;
	private readonly actions = new Map<CommandIconPair, HTMLElement>();
	private addBtn = createDiv({ cls: "cmdr status-bar-item cmdr-adder", attr: { "aria-label-position": "top", "aria-label": "Add new" } });

	public constructor(plugin: CommanderPlugin, pairs: CommandIconPair[]) {
		super(plugin, pairs);
		this.init();
		this.plugin.register(() => this.actions.forEach((_, key) => this.removeAction(key)));
	}

	private init(): void {
		app.workspace.onLayoutReady(() => {
			this.container = app.statusBar.containerEl;
			for (const cmd of this.pairs) {
				//Command has been removed
				if (!getCommandFromId(cmd.id)) {
					this.pairs.remove(cmd);
				}
				this.addAction(cmd);
			}
			this.plugin.saveSettings();

			this.plugin.registerDomEvent(this.container, "contextmenu", (event) => {
				if (event.target !== this.container) {
					return;
				}

				new Menu(app)
					.addItem(item => {
						item
							.setTitle("Add Command")
							.setIcon("command")
							.onClick(async () => {
								const pair = await chooseNewCommand(this.plugin);
								this.addCommand(pair);
							});
					})
					.showAtMouseEvent(event);
			});

			this.plugin.register(() => this.addBtn.remove());
			setIcon(this.addBtn, "plus", 12);
			this.addBtn.onclick = async (): Promise<void> => {
				const pair = await chooseNewCommand(this.plugin);
				this.addCommand(pair);
				this.reorder();
			};
			if (this.plugin.settings.showAddCommand) this.container.prepend(this.addBtn);
		});
	}

	public reorder(): void {
		this.addBtn.remove();
		this.actions.forEach((_, key) => this.removeAction(key, true));
		this.init();
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.push(pair);
		this.addAction(pair);
		await this.plugin.saveSettings();
	}

	public async removeCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.remove(pair);
		this.removeAction(pair);
		await this.plugin.saveSettings();
	}

	private addAction(pair: CommandIconPair): void {
		const btn = createDiv({ cls: "cmdr status-bar-item", attr: { "aria-label-position": "top", "aria-label": pair.name } });
		this.actions.set(pair, btn);

		let isRemovable = false;

		const setNormal = (): void => {
			btn.empty();
			setIcon(btn, pair.icon, 12);
			btn.onclick = (): void => app.commands.executeCommandById(pair.id);
		};
		const setRemovable = (): void => {
			btn.empty();
			setIcon(btn, "trash", 12);
			btn.onclick = async (): Promise<void> => {
				if (!this.plugin.settings.confirmDeletion || (await new ConfirmDeleteModal(this.plugin).didChooseRemove())) {
					this.removeCommand(pair);
				}
			};
		};

		btn.addEventListener("mouseleave", () => {
			setNormal();
			isRemovable = false;
		});
		btn.addEventListener("mousemove", (event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			if (event.shiftKey) {
				if (!isRemovable) setRemovable();
				isRemovable = true;
			}
		});
		btn.addEventListener("contextmenu", (event) => {
			event.stopImmediatePropagation();
			new Menu(app)
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
						.onClick(() => this.removeCommand(pair));
				})
				.showAtMouseEvent(event);
		});

		setNormal();
		this.container.prepend(btn);
	}

	private removeAction(pair: CommandIconPair, instant = false): void {
		const action = this.actions.get(pair);
		if (!action) return;

		if (instant) {
			action.remove();
			this.actions.delete(pair);
			return;
		}

		action.addClass("cmdr-ribbon-removing");
		action.addEventListener("transitionend", async () => {
			action.remove();
			this.actions.delete(pair);
		});
	}

}
