import { Modal } from "obsidian";
import { h, render, VNode } from "preact";
import CommanderPlugin from "src/main";
import { confirmDeleteComponent } from "./components/confirmDeleteComponent";

export default class ConfirmDeleteModal extends Modal {
	private reactComponent: VNode;
	public remove: boolean;

	// eslint-disable-next-line no-unused-vars
	public constructor(public plugin: CommanderPlugin) {
		super(app);
	}

	public async onOpen(): Promise<void> {
		this.titleEl.innerText = "Remove Command";
		this.containerEl.style.zIndex = "99";
		this.reactComponent = h(confirmDeleteComponent, { modal: this });
		render(this.reactComponent, this.contentEl);
	}

	public async didChooseRemove(): Promise<boolean> {
		this.open();
		return new Promise((resolve) => {
			this.onClose = (): void => resolve(this.remove ?? false);
		});
	}
}


