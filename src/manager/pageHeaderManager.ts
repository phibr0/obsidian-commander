import { setIcon } from "obsidian";
import CommanderPlugin from "src/main";
import { CommandIconPair } from "src/types";
import CommandManager from "./_commandManager";

export default class PageHeaderManager extends CommandManager {
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
		button: CommandIconPair
	): void {
		const { id, icon, name } = button;
		const ICON_SIZE = 16;
		const classes = ['view-action', "cmdr-page-header"];

		const buttonIcon = this.getButtonIcon(name, id, icon, ICON_SIZE, classes);
		viewActions.prepend(buttonIcon);

		this.plugin.registerDomEvent(buttonIcon, 'click', () => {
			/* this way the pane gets activated from the click
				otherwise the action would get executed on the former active pane
				timeout of 1 was enough, but 5 is chosen for slower computers
				may need to be made its own setting in the future
				 */
			setTimeout(() => app.commands.executeCommandById(id), 5);
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
