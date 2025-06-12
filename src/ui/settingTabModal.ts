import { Modal, Platform } from "obsidian";
import { h, render } from "preact";
import CommanderPlugin from "src/main";
import settingTabComponent from "./components/settingTabComponent";

export default class SettingTabModal extends Modal {
	private plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		super(plugin.app);
		this.plugin = plugin;
		this.containerEl.addClass("cmdr-setting-modal");
	}

	public onOpen(): void {
		const mobileMode = Platform.isMobile; //this.containerEl.getBoundingClientRect().width <= 1100;
		render(
			h(settingTabComponent, { plugin: this.plugin, mobileMode }),
			this.contentEl
		);
	}

	public onClose(): void {
		render(null, this.contentEl);
	}
}
