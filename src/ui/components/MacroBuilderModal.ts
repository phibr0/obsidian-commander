import { Modal } from "obsidian";
import { h, render } from "preact";
import CommanderPlugin from "src/main";
import { Macro } from "src/types";
import MacroBuilderComponent from "./MacroBuilder";

export default class MacroBuilderModal extends Modal {
	private plugin: CommanderPlugin;
	private macro: Macro;
	private onSave: (macro: Macro) => void;

	public constructor(
		plugin: CommanderPlugin,
		macro: Macro,
		onSave: (macro: Macro) => void
	) {
		super(app);
		this.macro = macro;
		this.plugin = plugin;
		this.onSave = onSave;
	}

	public onOpen(): void {
		this.titleEl.setText("Macro Builder");
		render(
			h(MacroBuilderComponent, {
				plugin: this.plugin,
				macro: this.macro,
				onSave: this.onSave,
				onCancel: this.close.bind(this),
			}),
			this.contentEl
		);
	}

	public onClose(): void {
		render(null, this.contentEl);
	}
}
