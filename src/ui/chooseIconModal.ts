import { ICON_LIST } from './../constants';
import { setIcon, FuzzySuggestModal, FuzzyMatch } from "obsidian";
import CommanderPlugin from "src/main";

export default class ChooseIconModal extends FuzzySuggestModal<string> {
	private plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		super(app);
		this.plugin = plugin;
		this.setPlaceholder("Choose a Icon for your new Command");

		this.setInstructions([
			{
				command: "↑↓",
				purpose: "to navigate"
			},
			{
				command: "↵",
				purpose: "to choose a custom name"
			},
			{
				command: "esc",
				purpose: "to cancel"
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
		super.renderSuggestion(item, el);
		setIcon(el.createSpan({ cls: "suggestion-flair" }), item.item);
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
