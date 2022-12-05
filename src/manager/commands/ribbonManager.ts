import { isModeActive } from 'src/util';
import { Menu, Platform, setIcon, WorkspaceRibbon } from "obsidian";
import CommandManagerBase from "./commandManager";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { chooseNewCommand, getCommandFromId } from "src/util";
import ChooseCustomNameModal from "src/ui/chooseCustomNameModal";
import ChooseIconModal from "src/ui/chooseIconModal";
import t from 'src/l10n';

export default class RibbonManager extends CommandManagerBase {
	private actions: {
		[id: string]: HTMLElement;
	};
	private ribbonEl: WorkspaceRibbon;
	private addBtn: HTMLDivElement;

	public constructor(
		private side: "left" | "right",
		plugin: CommanderPlugin,
	) {
		super(plugin, plugin.settings[`${side}Ribbon`]);
		this.actions = {};

		app.workspace.onLayoutReady(() => {
			if (this.side === "right") {
				this.addActionContainer();
			} else {
				this.ribbonEl = app.workspace.leftRibbon;
			}
			this.addBtn = createDiv({ cls: "cmdr side-dock-ribbon-action cmdr-adder", attr: { "aria-label-position": side === "left" ? "right" : "left", "aria-label": t("Add new") } });
			this.init();
		});

		this.plugin.register(() => {
			if (Platform.isMobile) {
				Object.keys(this.actions).forEach((id) => this.removeActionMobile(id));
			}
			else {
				Object.values(this.actions).forEach(el => el.remove());
			}
		});
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		const cmd = getCommandFromId(pair.id);
		if (cmd) {
			this.addAction(pair.name ?? cmd.name, pair.icon, pair, () => app.commands.executeCommandById(pair.id));
		} else {
			this.addAction(t("This Command seems to have been removed. {{command_name}}").replace("{{command_name}}", pair.name || ""), "trash", pair, (event: MouseEvent) => {
				this.removeAction((event.target as HTMLElement).getAttribute("aria-label") + "trash");
			});
		}

		this.pairs.push(pair);
		await this.plugin.saveSettings();
	}

	public async removeCommand(pair: CommandIconPair): Promise<void> {
		this.removeAction(pair.name + pair.icon);
		this.pairs.remove(pair);
		await this.plugin.saveSettings();
	}

	public reorder(): void | Promise<void> {
		this.addBtn.remove();
		if (Platform.isMobile) {
			Object.keys(this.actions).forEach((id) => this.removeActionMobile(id));
		}
		else {
			Object.values(this.actions).forEach(el => el.remove());
		}
		this.init();
	}

	private init(): void {
		for (const c of this.pairs) {
			if (isModeActive(c.mode)) {
				this.addAction(c.name, c.icon, c, () => app.commands.executeCommandById(c.id));
			}
		}

		this.plugin.register(() => this.addBtn.remove());
		setIcon(this.addBtn, "plus");
		this.addBtn.onclick = async (): Promise<void> => {
			const pair = await chooseNewCommand(this.plugin);
			this.addCommand(pair);
			this.reorder();
		};
		if (this.plugin.settings.showAddCommand)
			app.workspace.onLayoutReady(() =>
				this.ribbonEl.ribbonItemsEl?.append?.(this.addBtn)
			);
	}

	private addActionMobile(name: string, icon: string, callback: () => void) {
		app.workspace.leftRibbon.orderedRibbonActions.push({
			// @ts-expect-error
			cmdr__id: name + icon,
			title: name,
			icon,
			callback,
		});
	}

	private removeActionMobile(id: string): void {
		app.workspace.leftRibbon.orderedRibbonActions =
			// @ts-expect-error
			app.workspace.leftRibbon.orderedRibbonActions.filter((action) => action.cmdr__id !== id);
	}

	// eslint-disable-next-line no-unused-vars
	private addAction(name: string, icon: string, pair: CommandIconPair, callback: (event: MouseEvent) => void): void {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const newAction = this.ribbonEl.makeRibbonItemButton(
			icon,
			name,
			() => {}
		);
		newAction.addClass("cmdr");
		newAction.style.color =
			pair.color === "#000000" || pair.color === undefined
				? "inherit"
				: pair.color;
		newAction.setAttribute(
			"aria-label-position",
			this.side === "left" ? "right" : "left"
		);
		this.actions[name + icon] = newAction;

		if (Platform.isMobile) {
			// @ts-expect-error
			this.addActionMobile(name, icon, callback);
			return;
		}

		let isRemovable = false;

		const setNormal = (): void => {
			newAction.empty();
			setIcon(newAction, icon);
			newAction.onclick = callback;
		};
		const setRemovable = (): void => {
			newAction.empty();
			setIcon(newAction, "trash");
			newAction.onclick = async (): Promise<void> => {
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

		newAction.addEventListener("mouseleave", () => {
			isRemovable = false;
			setNormal();
		});
		newAction.addEventListener("mousemove", (event) => {
			event.preventDefault();
			event.stopImmediatePropagation();
			if (event.shiftKey) {
				if (!isRemovable) setRemovable();
				isRemovable = true;
			}
		});
		newAction.addEventListener("contextmenu", (event) => {
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

		this.ribbonEl.ribbonItemsEl?.append(newAction);
	}

	private async removeAction(id: string): Promise<void> {
		if (Platform.isMobile) {
			this.removeActionMobile(id);
			return;
		}
		this.actions[id].addClass("cmdr-ribbon-removing");
		this.actions[id].addEventListener("transitionend", () => {
			this.actions[id].remove();
			delete this.actions[id];
		});
	}

	private addActionContainer(): void {
		const div = createDiv({ cls: `side-dock-actions cmdr-${this.side}-ribbon` });
		this.ribbonEl.collapseButtonEl.insertAdjacentElement("afterend", div);
		this.ribbonEl.ribbonItemsEl = div;

		this.plugin.register(() => div.remove());
	}
}
