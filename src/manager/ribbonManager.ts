import { setIcon, WorkspaceRibbon } from "obsidian";
import CommandManager from "./_commandManager";
import CommanderPlugin from "../main";
import { CommandIconPair } from "../types";
import ConfirmDeleteModal from "../ui/confirmDeleteModal";
import { getCommandFromId } from "../util";

export default class RibbonManager extends CommandManager {
	private actions: {
		[id: string]: HTMLElement;
	};
	private ribbonEl: WorkspaceRibbon;

	public constructor(
		private side: "left" | "right",
		plugin: CommanderPlugin,
	) {
		super(plugin, plugin.settings[`${side}Ribbon`]);
		this.actions = {};
		this.ribbonEl = app.workspace[`${side}Ribbon`];

		app.workspace.onLayoutReady(() => {
			if (this.side === "right") {
				this.addActionContainer();
			}
			this.init();
		});

		this.plugin.register(() => Object.values(this.actions).forEach(el => el.remove()));
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		const cmd = getCommandFromId(pair.id);
		if (cmd) {
			this.addAction(pair.name ?? cmd.name, pair.icon, pair, () => app.commands.executeCommandById(pair.id));
		} else {
			this.addAction(`This Command seems to have been removed. ${pair.name ? "(" + pair.name + ")" : ""}`, "trash", pair, (event: MouseEvent) => {
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
		Object.values(this.actions).forEach(el => el.remove());
		this.init();
	}

	private init(): void {
		for (const c of this.pairs) this.addAction(c.name, c.icon, c, () => app.commands.executeCommandById(c.id));
	}

	// eslint-disable-next-line no-unused-vars
	private addAction(name: string, icon: string, pair: CommandIconPair, callback: (event: MouseEvent) => void): void {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		const newAction = this.ribbonEl.makeRibbonActionButton(icon, name, () => { });
		newAction.addClass("cmdr");
		newAction.setAttribute("aria-label-position", this.side === "left" ? "right" : "left");
		this.actions[name + icon] = newAction;

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
				if (!this.plugin.settings.confirmDeletion || (await new ConfirmDeleteModal(this.plugin).didChooseRemove())) {
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

		setNormal();

		this.ribbonEl.ribbonActionsEl?.append(newAction);
	}

	private async removeAction(id: string): Promise<void> {
		this.actions[id].addClass("cmdr-ribbon-removing");
		this.actions[id].addEventListener("transitionend", () => {
			this.actions[id].remove();
			delete this.actions[id];
		});
	}

	private addActionContainer(): void {
		const div = createDiv({ cls: `side-dock-actions cmdr-${this.side}-ribbon` });
		this.ribbonEl.collapseButtonEl.insertAdjacentElement("afterend", div);
		this.ribbonEl.ribbonActionsEl = div;

		this.plugin.register(() => div.remove());
	}
}
