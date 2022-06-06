import { SuggestModal } from "obsidian";

export default class ChooseCustomNameModal extends SuggestModal<string> {

	// This is used in onOpen, not sure why eslint doesn't recognize it
	// eslint-disable-next-line no-unused-vars
	public constructor(private defaultName: string) {
		super(app);
		this.setPlaceholder("Use a custom name");
		this.resultContainerEl.style.display = "none";

		this.setInstructions([
			{
				command: "",
				purpose: "Choose a custom Name for your new Command"
			},
			{
				command: "↑↓",
				purpose: "to navigate"
			},
			{
				command: "↵",
				purpose: "to save"
			},
			{
				command: "esc",
				purpose: "to cancel"
			},
		]);
	}

	public onOpen(): void {
		super.onOpen();
		this.inputEl.value = this.defaultName;
	}

	public async awaitSelection(): Promise<string> {
		this.open();
		return new Promise((resolve, reject) => {
			this.onChooseSuggestion = (item): void => resolve(item);
			//This is wrapped inside a setTimeout, because onClose is called before onChooseItem
			this.onClose = (): number => window.setTimeout(() => reject("No Name selected"), 0);
		});
	}

	public getSuggestions(query: string): string[] | Promise<string[]> {
		return [query];
	}

	// This isn't needed, since we just want a text field without options
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
	public renderSuggestion(value: string, el: HTMLElement): void { }

	// This will be overriden anyway, but typescript complains if it's not declared
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
	public onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent): void { }
}
