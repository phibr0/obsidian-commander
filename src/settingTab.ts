import { PluginSettingTab, App } from "obsidian";
import CommanderPlugin from "./main";

export default class CommanderSettingTab extends PluginSettingTab {
    plugin: CommanderPlugin;

    constructor(app: App, plugin: CommanderPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
    }
}
