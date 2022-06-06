import { Modal } from "obsidian";
import { h, render } from "preact";
import CommanderPlugin from "src/main";
import settingTabComponent from "./components/settingTabComponent";

export default class SettingTabModal extends Modal {
	private plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		super(app);
		this.plugin = plugin;
		this.containerEl.addClass('cmdr-setting-modal');
	}

	public onOpen(): void {
		render(h(settingTabComponent, { plugin: this.plugin }), this.contentEl);
	}

	public onClose(): void {
		render(null, this.contentEl);
	}
}
