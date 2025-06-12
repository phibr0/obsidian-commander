import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import CommandManagerBase from "./commandManager";
import { isModeActive } from "src/util";

export default class LeftRibbonManager extends CommandManagerBase {
	public plugin: CommanderPlugin;
	//private addBtn: HTMLDivElement;

	public constructor(plugin: CommanderPlugin) {
		super(plugin, plugin.settings.leftRibbon);
		this.plugin = plugin;

		this.plugin.settings.leftRibbon.forEach((pair) =>
			this.addCommand(pair, false)
		);

		this.plugin.app.workspace.onLayoutReady(() => {
			// if (this.plugin.settings.showAddCommand) {
			// 	this.plugin.addRibbonIcon("plus", t("Add new"), async () =>
			// 		this.addCommand(await chooseNewCommand(plugin))
			// 	);
			// }
		});
	}

	public async addCommand(
		pair: CommandIconPair,
		newlyAdded = true
	): Promise<void> {
		if (newlyAdded) {
			this.plugin.settings.leftRibbon.push(pair);
			await this.plugin.saveSettings();
		}
		if (isModeActive(pair.mode, this.plugin)) {
			this.plugin.addRibbonIcon(pair.icon, pair.name, () =>
				this.plugin.app.commands.executeCommandById(pair.id)
			);
			// @ts-expect-error
			const nativeAction = this.plugin.app.workspace.leftRibbon.items.find(
				// @ts-expect-error
				(i) => i.icon === pair.icon && i.name === i.name
			);
			if (nativeAction) {
				nativeAction.buttonEl.style.color =
					pair.color === "#000000" || pair.color === undefined
						? "inherit"
						: pair.color;
			}
			this.plugin.register(() => this.removeCommand(pair, false));
		}
	}

	public async removeCommand(
		pair: CommandIconPair,
		remove = true
	): Promise<void> {
		if (remove) {
			this.plugin.settings.leftRibbon.remove(pair);
			await this.plugin.saveSettings();
		}
		// @ts-expect-error
		const nativeAction = this.plugin.app.workspace.leftRibbon.items.find(
			// @ts-expect-error
			(i) => i.icon === pair.icon && i.name === i.name
		);
		if (nativeAction) {
			nativeAction.buttonEl.remove();
		}
		// @ts-expect-error
		app.workspace.leftRibbon.items.remove(nativeAction);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public reorder(): void {
		this.plugin.settings.leftRibbon.forEach((pair) => {
			this.removeCommand(pair, false);
			this.addCommand(pair, false);
		});
	}
}
