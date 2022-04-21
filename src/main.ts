import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS } from './constants';
import CommanderSettingTab from './settingTab';
import { CommanderSettings } from './types';

export default class CommanderPlugin extends Plugin {
	settings: CommanderSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new CommanderSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
