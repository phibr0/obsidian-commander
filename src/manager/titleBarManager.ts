import { setIcon } from "obsidian";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import ConfirmDeleteModal from "src/ui/confirmDeleteModal";
import { getCommandFromId } from "src/util";
import CommandManager from "./_commandManager";

export default class TitleBarManager extends CommandManager {
	private container: HTMLElement;
	private readonly actions = new Map<CommandIconPair, HTMLElement>();

	public constructor(plugin: CommanderPlugin, pairArray: CommandIconPair[]) {
		super(plugin, pairArray);
		this.init();
		this.plugin.register(() => this.actions.forEach((_, key) => this.removeTitleBarAction(key)));
	}

	private init(): void {
		app.workspace.onLayoutReady(async () => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			this.container = document.querySelector(".titlebar div.titlebar-button-container.mod-right")!;
			for (const cmd of this.pairs) {
				//Command has been removed
				if (!getCommandFromId(cmd.id)) {
					this.pairs.remove(cmd);
				}
				this.addTitleBarAction(cmd);
			}
			this.plugin.saveSettings();
		});
	}

	public reorder(): void {
		this.actions.forEach((_, key) => this.removeTitleBarAction(key, true));
		this.init();
	}

	public async addCommand(pair: CommandIconPair): Promise<void> {
		this.pairs.push(pair);
		this.addTitleBarAction(pair);
		await this.plugin.saveSettings();
	}

	private async addTitleBarAction(pair: CommandIconPair): Promise<void> {
		const btn = createDiv({ cls: "cmdr titlebar-button", attr: { "aria-label": pair.name } });
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
