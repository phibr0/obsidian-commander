import { DiagramSchema, Node } from 'beautiful-react-diagrams/@types/DiagramSchema';
import CommanderPlugin from 'src/main';

enum Action {
	COMMAND = "command",
	DELAY = "delay",
	EDITOR = "editor",
}

type Macro = { action: Action.COMMAND, commandId: string }
	| { action: Action.DELAY, delay: number }
	| { action: Action.EDITOR };

export default class MacroExecutor {
	public readonly plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		this.plugin = plugin;
	}

	private static getNode(macro: DiagramSchema<Macro>, linkId: string): Node<Macro> | undefined {
		const number = linkId.split("-")[1];
		const node = macro.nodes.find(node => node.id === `node-${number}`);
		return node;
	}

	private buildExecutorChain(macro: DiagramSchema<Macro>): Promise<void>[][] {
		if (macro.links === undefined) {
			console.error(macro);
			throw new Error("Macro does not have any links");
		}
		const chain: Promise<void>[][] = [];
		const start = macro.links.find(link => link.output === "node-1-out");
		if (start === undefined) {
			console.error(macro);
			throw new Error("Macro does not have a start node");
		}

		const nodeData = MacroExecutor.getNode(macro, start.input)?.data;
		macro.links.find(link => link.output === start.output);


		return chain;
	}

	public executeMacro(macro: DiagramSchema<Macro>): void {

	}
}
