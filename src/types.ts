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
	macros: Macro[];
	hide: {
		statusbar: string[];
		leftRibbon: string[];
	}
}

export interface Macro {
	nodes: any[];
	edges: any[]
}

export type Mode = "desktop" | "any" | "mobile" | string;

export interface CommandIconPair {
	id: string;
	icon: string;
	name: string;
	mode: Mode;
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
		appId: string;
		isMobile: boolean;
		setting: {
			closeActiveTab: () => void;
		}
	}

	interface WorkspaceRibbon {
		collapseButtonEl: HTMLElement;
		ribbonActionsEl?: HTMLElement;
		addRibbonActionButton: (icon: string, name: string, callback: (event: MouseEvent) => void) => void;
		makeRibbonActionButton: (icon: string, name: string, callback: (event: MouseEvent) => void) => HTMLElement;
	}
}
