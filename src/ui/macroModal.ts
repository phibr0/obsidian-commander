import { Modal } from "obsidian";
import { h, render } from "preact";
import CommanderPlugin from "src/main";
import MacroBuilderComponent from "./components/macroBuilderComponent";

export default class MacroModal extends Modal {
	private plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		super(app);
		this.plugin = plugin;
		this.containerEl.addClass('cmdr-macro-builder');
	}

	public onOpen(): void {
		render(h(MacroBuilderComponent, { plugin: this.plugin }), this.contentEl);
	}

	public onClose(): void {
		render(null, this.contentEl);
	}
}
