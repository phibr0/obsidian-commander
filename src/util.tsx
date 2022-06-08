import { CommandIconPair } from './types';
import CommanderPlugin from "./main";
import AddCommandModal from "./ui/addCommandModal";
import ChooseIconModal from './ui/chooseIconModal';
import { Command, setIcon } from 'obsidian';
import ChooseCustomNameModal from './ui/chooseCustomNameModal';
import { h } from 'preact';
import { useRef, useEffect } from 'preact/hooks';

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
		name: name || command.name
	};
}

export function getCommandFromId(id: string): Command | null {
	return app.commands.commands[id] ?? null;
}

export function ObsidianIcon({ icon, size }: { icon: string, size?: number }): h.JSX.Element {
	const iconEl = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		setIcon(iconEl.current!, icon, size);
	}, [icon, size]);

	return <div style={{ display: "grid" }} ref={iconEl} />;
}
