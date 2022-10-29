import { DiagramSchema, Node } from 'beautiful-react-diagrams/@types/DiagramSchema';
import CommanderPlugin from 'src/main';

export default class MacroExecutor {
	public readonly plugin: CommanderPlugin;

	public constructor(plugin: CommanderPlugin) {
		this.plugin = plugin;
	}
}
