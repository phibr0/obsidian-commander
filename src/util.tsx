import { CommanderSettings, CommandIconPair } from './types';
import CommanderPlugin from "./main";
import AddCommandModal from "./ui/addCommandModal";
import ChooseIconModal from './ui/chooseIconModal';
import { Command, setIcon } from 'obsidian';
import ChooseCustomNameModal from './ui/chooseCustomNameModal';
import { ComponentProps, h } from 'preact';
import { useRef, useLayoutEffect } from 'preact/hooks';

/**
 * It creates a modal, waits for the user to select a command, and then creates another modal to wait
 * for the user to select an icon
 * @param {CommanderPlugin} plugin - The plugin that is calling the modal.
 * @returns {CommandIconPair}
 */
export async function chooseNewCommand(plugin: CommanderPlugin): Promise<CommandIconPair> {

	const command = await new AddCommandModal(plugin).awaitSelection();

	let icon;
	if (!command.hasOwnProperty("icon")) {
		icon = await new ChooseIconModal(plugin).awaitSelection();
	}

	const name = await new ChooseCustomNameModal(command.name).awaitSelection();

	return {
		id: command.id,
		//This cannot be undefined anymore
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		icon: icon ?? command.icon!,
		name: name || command.name,
		mode: "any"
	};
}

export function getCommandFromId(id: string): Command | null {
	return app.commands.commands[id] ?? null;
}

interface ObsidianIconProps extends ComponentProps<"div"> {
	icon: string;
	size?: number;
}
export function ObsidianIcon({ icon, size, ...props }: ObsidianIconProps): h.JSX.Element {
	const iconEl = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		setIcon(iconEl.current!, icon, size);
	}, [icon, size]);

	return <div ref={iconEl} {...props} style={{ display: "grid" }} />;
}

export function isModeActive(mode: string): boolean {
	const { isMobile, appId } = app;
	return mode === "any" || mode === appId || (mode === "mobile" && isMobile) || (mode === "desktop" && !isMobile);
}

export function updateHiderStylesheet(settings: CommanderSettings): void {
	let style = "";
	for (const id of settings.hide.statusbar) {
		style += `div.status-bar-item.plugin-${id} {display: none; content-visibility: hidden;}`;
	}
	for (const name of settings.hide.leftRibbon) {
		style += `div.side-dock-ribbon-action[aria-label="${name}"] {display: none; content-visibility: hidden;}`;
	}

	document.head.querySelector("style#cmdr")?.remove();

	if (style) {
		document.head.appendChild(createEl("style", { attr: { "id": "cmdr" }, text: style, type: "text/css" }));
	}
}
