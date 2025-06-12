import {
	AdvancedToolbarSettings,
	CommanderSettings,
	CommandIconPair,
} from "./types";
import CommanderPlugin from "./main";
import AddCommandModal from "./ui/addCommandModal";
import ChooseIconModal from "./ui/chooseIconModal";
import { Command, Platform, setIcon } from "obsidian";
import ChooseCustomNameModal from "./ui/chooseCustomNameModal";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ComponentProps, h, JSX } from "preact";
/** @jsx h */
import { useRef, useLayoutEffect } from "preact/hooks";
import confetti from "canvas-confetti";

/**
 * It creates a modal, waits for the user to select a command, and then creates another modal to wait
 * for the user to select an icon
 * @param {CommanderPlugin} plugin - The plugin that is calling the modal.
 * @returns {CommandIconPair}
 */
export async function chooseNewCommand(
	plugin: CommanderPlugin
): Promise<CommandIconPair> {
	const command = await new AddCommandModal(plugin).awaitSelection();

	let icon;
	if (!command.hasOwnProperty("icon")) {
		icon = await new ChooseIconModal(plugin).awaitSelection();
	}

	const name = await new ChooseCustomNameModal(
		command.name, 
		plugin
	).awaitSelection();

	return {
		id: command.id,
		//This cannot be undefined anymore
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		icon: icon ?? command.icon!,
		name: name || command.name,
		mode: "any",
	};
}

export function getCommandFromId(id: string, plugin: CommanderPlugin): Command | null {
	return plugin.app.commands.commands[id] ?? null;
}

interface ObsidianIconProps extends ComponentProps<"div"> {
	icon: string;
	size?: number;
}
export function ObsidianIcon({
	icon,
	size,
	...props
}: ObsidianIconProps): JSX.Element {
	const iconEl = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		setIcon(iconEl.current!, icon);
	}, [icon, size]);

	return <div ref={iconEl} {...props} />;
}

export function isModeActive(mode: string, plugin: CommanderPlugin): boolean {
	const { isMobile, appId } = plugin.app;
	return (
		mode === "any" ||
		mode === appId ||
		(mode === "mobile" && isMobile) ||
		(mode === "desktop" && !isMobile)
	);
}

export function updateHiderStylesheet(settings: CommanderSettings): void {
	let style = "";
	for (const name of settings.hide.leftRibbon ?? []) {
		style += `div.side-dock-ribbon-action[aria-label="${name}"] {display: none !important; content-visibility: hidden;}`;
	}
	for (const id of settings.hide.statusbar) {
		style += `div.status-bar-item.plugin-${id} {display: none !important; content-visibility: hidden;}`;
	}

	document.head.querySelector("style#cmdr")?.remove();

	if (style) {
		const styleEl = document.createElement("style");
		styleEl.id = "cmdr";
		styleEl.type = "text/css";
		styleEl.textContent = style;
		document.head.appendChild(styleEl);
	}
}

export async function showConfetti({ target }: MouseEvent): Promise<void> {
	const myCanvas = document.createElement("canvas");
	document.body.appendChild(myCanvas);
	myCanvas.style.position = "fixed";
	myCanvas.style.width = "100vw";
	myCanvas.style.height = "100vh";
	myCanvas.style.top = "0px";
	myCanvas.style.left = "0px";
	//@ts-ignore
	myCanvas.style["pointer-events"] = "none";
	//@ts-ignore
	myCanvas.style["z-index"] = "100";

	const myConfetti = confetti.create(myCanvas, {
		resize: true,
		useWorker: true,
	});
	const pos = (target as HTMLDivElement).getBoundingClientRect();

	await myConfetti({
		particleCount: Platform.isDesktop ? 160 : 80,
		startVelocity: 55,
		spread: 75,
		angle: 90,
		drift: -1,
		ticks: 250,
		origin: {
			//Center of the target component using values from 0 to 1
			x: (pos.x + pos.width / 2) / window.innerWidth,
			y: (pos.y + pos.height / 2) / window.innerHeight,
		},
	});

	myCanvas.remove();
}

export function updateSpacing(spacing: number): void {
	document.body.style.setProperty("--cmdr-spacing", `${spacing}px`);
}

export function updateMacroCommands(plugin: CommanderPlugin): void {
	const oldCommands = Object.keys(plugin.app.commands.commands).filter((p) =>
		p.startsWith("cmdr:macro-")
	);
	for (const command of oldCommands) {
		//@ts-ignore
		plugin.app.commands.removeCommand(command);
	}

	const macros = plugin.settings.macros;
	for (const [idx, macro] of macros.entries()) {
		const commandId = `macro-${idx}`;
		
		// Create the command with direct icon assignment
		plugin.addCommand({
			id: commandId,
			name: macro.name,
			icon: macro.icon, // Set icon directly on the command
			callback: () => {
				plugin.executeMacro(Number(idx));
			},
		});

		// Also maintain icon mapping for mobile toolbar compatibility
		if (macro.icon) {
			const existingMapping = plugin.settings.advancedToolbar.mappedIcons.find(
				m => m.commandID === `cmdr:${commandId}`
			);
			if (existingMapping) {
				existingMapping.iconID = macro.icon;
			} else {
				plugin.settings.advancedToolbar.mappedIcons.push({
					commandID: `cmdr:${commandId}`,
					iconID: macro.icon
				});
			}
		}
	}

	// Save the updated settings
	void plugin.saveSettings();
}

export function updateStyles(settings: AdvancedToolbarSettings): void {
	const { classList: c, style: s } = document.body;
	s.setProperty("--at-button-height", (settings.rowHeight ?? 48) + "px");
	s.setProperty("--at-button-width", (settings.buttonWidth ?? 48) + "px");
	s.setProperty("--at-row-count", settings.rowCount.toString());
	s.setProperty("--at-spacing", settings.spacing + "px");
	s.setProperty("--at-offset", settings.heightOffset + "px");
	c.toggle("AT-multirow", settings.rowCount > 1);
	c.toggle("AT-row", !settings.columnLayout);
	c.toggle("AT-column", settings.columnLayout);
	c.toggle("AT-no-toolbar", settings.rowCount === 0);
}

export function removeStyles(): void {
	const { classList: c, style: s } = document.body;
	s.removeProperty("--at-button-height");
	s.removeProperty("--at-button-width");
	s.removeProperty("--at-row-count");
	s.removeProperty("--at-spacing");
	s.removeProperty("--at-offset");
	c.remove("AT-multirow");
	c.remove("AT-row");
	c.remove("AT-column");
	c.remove("AT-no-toolbar");
	c.remove("advanced-toolbar");
}

export function injectIcons(
	settings: AdvancedToolbarSettings,
	plugin: CommanderPlugin
): void {
	settings.mappedIcons.forEach((mapped) => {
		const commandId = mapped.commandID.replace('cmdr:', '');
		const command = plugin.app.commands.commands[commandId];
		if (command) {
			command.icon = mapped.iconID;
		} else {
			settings.mappedIcons = settings.mappedIcons.filter(m => m !== mapped);
		}
	});
}
