import { Modal } from "obsidian";
import { h, render } from "preact";
import CommanderPlugin from "src/main";
import { Toggle } from "src/types";
import ToggleBuilderComponent from "./ToggleBuilder";

export default class ToggleBuilderModal extends Modal {
	private plugin: CommanderPlugin;
	private toggle: Toggle;
	private onSave: (toggle: Toggle) => void;

	public constructor(
		plugin: CommanderPlugin,
		toggle: Toggle,
		onSave: (toggle: Toggle) => void
	) {
		super(app);
		this.toggle = toggle;
		this.plugin = plugin;
		this.onSave = onSave;
	}

	public onOpen(): void {
		this.titleEl.setText("Toggle Builder");
		render(
			h(ToggleBuilderComponent, {
				plugin: this.plugin,
				toggle: this.toggle,
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
