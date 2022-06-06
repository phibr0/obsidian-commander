import { Command, setIcon, FuzzySuggestModal, FuzzyMatch } from "obsidian";
import CommanderPlugin from "src/main";

export default class AddCommandModal extends FuzzySuggestModal<Command> {
	plugin: CommanderPlugin;
	commands: Command[];

	constructor(plugin: CommanderPlugin) {
		super(app);
		this.plugin = plugin;
		this.commands = Object.values(app.commands.commands);
		this.setPlaceholder("Choose a Command to add");

		this.setInstructions([
			{
				command: "↑↓",
				purpose: "to navigate"
			},
			{
				command: "↵",
				purpose: "to choose an icon"
			},
			{
				command: "esc",
				purpose: "to cancel"
			},
		]);
	}

	async awaitSelection(): Promise<Command> {
		this.open();
		return new Promise((resolve, reject) => {
			this.onChooseItem = (item): void => resolve(item);
			//This is wrapped inside a setTimeout, because onClose is called before onChooseItem
			this.onClose = (): number => window.setTimeout(() => reject("No Command selected"), 0);
		});
	}

	renderSuggestion(item: FuzzyMatch<Command>, el: HTMLElement): void {
		super.renderSuggestion(item, el);

		//Append the icon if available
		if (item.item.icon) {
			setIcon(el.createSpan({ cls: "suggestion-flair" }), item.item.icon);
		}
	}

	getItems(): Command[] {
		return this.commands;
	}

	getItemText(item: Command): string {
		return item.name;
	}

	// This will be overriden anyway, but typescript complains if it's not declared
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
	onChooseItem(item: Command, evt: MouseEvent | KeyboardEvent): void { }
}
