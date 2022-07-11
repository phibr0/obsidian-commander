import { ICON_LIST } from './../constants';
import { setIcon, FuzzySuggestModal, FuzzyMatch } from "obsidian";
import CommanderPlugin from "src/main";
import t from 'src/l10n';

export default class ChooseIconModal extends FuzzySuggestModal<string> {
	private plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder(t("Choose a Icon for your new Command"));

		this.setInstructions([
			{
				command: "↑↓",
				purpose: t("to navigate")
			},
			{
				command: "↵",
				purpose: t("to choose a custom icon")
			},
			{
				command: "esc",
				purpose: t("to cancel")
			},
		]);
	}

	public async awaitSelection(): Promise<string> {
		this.open();
		return new Promise((resolve, reject) => {
			this.onChooseItem = (item): void => resolve(item);
			//This is wrapped inside a setTimeout, because onClose is called before onChooseItem
			this.onClose = (): number => window.setTimeout(() => reject("No Icon selected"), 0);
		});
	}

	public renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
		el.addClass("mod-complex");
		const content = el.createDiv({ cls: "suggestion-content" });
		content.createDiv({ cls: "suggestion-title" }).setText(item.item.replace(/-/g, " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()));

		const aux = el.createDiv({ cls: "suggestion-aux" });
		setIcon(aux.createSpan({ cls: "suggestion-flair" }), item.item);
	}

	public getItems(): string[] {
		return ICON_LIST;
	}

	public getItemText(item: string): string {
		return item;
	}

	// This will be overriden anyway, but typescript complains if it's not declared
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
	public onChooseItem(_: string, __: MouseEvent | KeyboardEvent): void { }
}
