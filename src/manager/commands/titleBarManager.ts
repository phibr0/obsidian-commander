import { Menu, setIcon } from "obsidian";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ChooseCustomNameModal from "src/ui/chooseCustomNameModal";
import ChooseIconModal from "src/ui/chooseIconModal";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { chooseNewCommand, getCommandFromId, isModeActive } from "src/util";
import CommandManagerBase from "./commandManager";

export default class TitleBarManager extends CommandManagerBase {
	private container: HTMLElement;
	private readonly actions = new Map<CommandIconPair, HTMLElement>();
	private addBtn = createDiv({
		cls: "cmdr titlebar-button cmdr-adder",
		attr: { "aria-label": t("Add new") },
	});

	public constructor(plugin: CommanderPlugin, pairArray: CommandIconPair[]) {
		super(plugin, pairArray);
		this.init();
		this.plugin.register(() =>
			this.actions.forEach((_, key) => this.removeTitleBarAction(key))
		);
	}

	private init(): void {
		app.workspace.onLayoutReady(async () => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.container = document.querySelector(
				".titlebar div.titlebar-button-container.mod-right"
			)!;
			for (const cmd of this.pairs) {
				//Command has been removed
				if (!getCommandFromId(cmd.id)) {
					this.pairs.remove(cmd);
				}

				if (isModeActive(cmd.mode)) {
					this.addTitleBarAction(cmd);
				}
			}
			this.plugin.saveSettings();

			this.plugin.register(() => this.addBtn.remove());
			this.addBtn.style.setProperty("--icon-size", `12px`);
			setIcon(this.addBtn, "plus");
			this.addBtn.onclick = async (): Promise<void> => {
				const pair = await chooseNewCommand(this.plugin);
				this.addCommand(pair);
				this.reorder();
			};
			if (this.plugin.settings.showAddCommand)
				this.container.prepend(this.addBtn);
		});
	}

	public reorder(): void {
		this.addBtn.remove();
		this.actions.forEach((_, key) => this.removeTitleBarAction(key, true));
		this.init();
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.push(pair);
		this.addTitleBarAction(pair);
		await this.plugin.saveSettings();
	}

	private async addTitleBarAction(pair: CommandIconPair): Promise<void> {
		const btn = createDiv({
			cls: "cmdr titlebar-button",
			attr: { "aria-label": pair.name },
		});
		this.actions.set(pair, btn);

		let isRemovable = false;

		const setNormal = (): void => {
			btn.empty();
			setIcon(btn, pair.icon);
			btn.onclick = (): void => app.commands.executeCommandById(pair.id);
		};
		const setRemovable = (): void => {
			btn.empty();
			setIcon(btn, "trash");
			btn.onclick = async (): Promise<void> => {
				if (
					!this.plugin.settings.confirmDeletion ||
					(await new ConfirmDeleteModal(
						this.plugin
					).didChooseRemove())
				) {
					this.removeCommand(pair);
				}
			};
		};

		btn.addEventListener("mouseleave", () => {
			isRemovable = false;
			setNormal();
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
			new Menu()
				.addItem((item) => {
					item.setTitle(t("Add command"))
						.setIcon("command")
						.onClick(async () => {
							const pair = await chooseNewCommand(this.plugin);
							this.addCommand(pair);
						});
				})
				.addSeparator()
				.addItem((item) => {
					item.setTitle(t("Change Icon"))
						.setIcon("box")
						.onClick(async () => {
							const newIcon = await new ChooseIconModal(
								this.plugin
							).awaitSelection();
							if (newIcon && newIcon !== pair.icon) {
								pair.icon = newIcon;
								await this.plugin.saveSettings();
								this.reorder();
							}
						});
				})
				.addItem((item) => {
					item.setTitle(t("Rename"))
						.setIcon("text-cursor-input")
						.onClick(async () => {
							const newName = await new ChooseCustomNameModal(
								pair.name
							).awaitSelection();
							if (newName && newName !== pair.name) {
								pair.name = newName;
								await this.plugin.saveSettings();
								this.reorder();
							}
						});
				})
				.addItem((item) => {
					item.dom.addClass("is-warning");
					item.setTitle(t("Delete"))
						.setIcon("lucide-trash")
						.onClick(async () => {
							if (
								!this.plugin.settings.confirmDeletion ||
								(await new ConfirmDeleteModal(
									this.plugin
								).didChooseRemove())
							) {
								this.removeCommand(pair);
							}
						});
				})
				.showAtMouseEvent(event);
		});

		setNormal();
		this.container.prepend(btn);
	}

	public async removeCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.remove(pair);
		this.removeTitleBarAction(pair);
		await this.plugin.saveSettings();
	}

	private removeTitleBarAction(pair: CommandIconPair, instant = false): void {
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
