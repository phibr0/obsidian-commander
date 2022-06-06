import type { Node, Edge } from "react-flow-renderer";

export interface CommanderSettings {
	confirmDeletion: boolean;
	showAddCommand: boolean;
	debug: boolean;
	editorMenu: CommandIconPair[];
	fileMenu: CommandIconPair[];
	leftRibbon: CommandIconPair[];
	rightRibbon: CommandIconPair[];
	titleBar: CommandIconPair[];
	statusBar: CommandIconPair[];
	pageHeader: CommandIconPair[];
	macros: Macro[]
}

export interface Macro {
	nodes: Node[];
	edges: Edge[]
}

export interface CommandIconPair {
	id: string;
	icon: string;
	name: string;
}

/* eslint-disable no-unused-vars */
declare module "obsidian" {
	interface MenuItem {
		dom: HTMLElement;
	}

	interface App {
		commands: {
			commands: {
				[id: string]: Command;
			}
			executeCommandById: (id: string) => void;
		}
		plugins: {
			manifests: {
				[id: string]: PluginManifest;
			}
		}
		statusBar: {
			containerEl: HTMLElement;
		}
	}

	interface WorkspaceRibbon {
		collapseButtonEl: HTMLElement;
		ribbonActionsEl?: HTMLElement;
		addRibbonActionButton: (icon: string, name: string, callback: (event: MouseEvent) => void) => void;
		makeRibbonActionButton: (icon: string, name: string, callback: (event: MouseEvent) => void) => HTMLElement;
	}
}
