import { setIcon } from "obsidian";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { getCommandFromId } from "src/util";
import CommandManager from "./_commandManager";

export default class StatusBarManager extends CommandManager {
	private container: HTMLElement;
	private readonly actions = new Map<CommandIconPair, HTMLElement>();

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
		});
	}

	public reorder(): void {
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
