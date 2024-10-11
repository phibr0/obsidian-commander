/* eslint-disable no-unused-vars */
import { CommandIconPair } from "src/types";
import { Modal } from "obsidian";
import { h, render, VNode } from "preact";
import MobileModifyComponent from "./components/mobileModifyComponent";
import CommanderPlugin from "src/main";

export default class MobileModifyModal extends Modal {
	private reactComponent: VNode;
	public remove: boolean;

	public constructor(
		private plugin: CommanderPlugin,
		public pair: CommandIconPair,
		public handleRename: (name: string) => void,
		public handleNewIcon: () => void,
		public handleModeChange: (mode?: string) => void,
		public handleColorChange: (color?: string) => void
	) {
		super(plugin.app);
	}

	public async onOpen(): Promise<void> {
		this.titleEl.innerText = this.pair.name;
		this.reactComponent = h(MobileModifyComponent, {
			plugin: this.plugin,
			modal: this,
		});
		render(this.reactComponent, this.contentEl);
	}

	public onClose(): void {
		render(null, this.contentEl);
	}
}
