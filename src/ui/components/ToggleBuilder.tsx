import { h } from "preact";
import { useState } from "preact/hooks";
import CommanderPlugin from "src/main";
import { Toggle } from "src/types";
import { getCommandFromId, ObsidianIcon } from "src/util";
import AddCommandModal from "../addCommandModal";
import ChooseIconModal from "../chooseIconModal";

interface ToggleBuilderProps {
	plugin: CommanderPlugin;
	toggle: Toggle;
	onSave: (toggle: Toggle) => void;
	onCancel: () => void;
}
export default function ({
	plugin,
	toggle,
	onSave,
	onCancel,
}: ToggleBuilderProps): h.JSX.Element {
	const [name, setName] = useState(toggle.name || "Toggle Name");
	const [icon, setIcon] = useState(toggle.icon || "star");
	const [nextCommandIndex] = useState(toggle.nextCommandIndex || 0);
	const [triggerWhenExitingFullscreen, setTriggerWhenExitingFullscreen] = useState(toggle.triggerWhenExitingFullscreen || false);
	const [triggerWhenEnteringFullscreen, setTriggerWhenEnteringFullscreen] = useState(toggle.triggerWhenEnteringFullscreen || false);
	const [commands, setCommands] = useState<string[]>(
		JSON.parse(JSON.stringify(toggle.commands)) || []
	);

	const handleAddCommand = async () : Promise<void> => {
		const command = await new AddCommandModal(plugin).awaitSelection();
		if (command) {
			setCommands([...commands, command.id]);
		}
	};

	return (
		<div>
			<div class="setting-item cmdr-mm-item">
				<div>
					<span>Name</span>
					<input
						type="text"
						placeholder="Toggle Name"
						value={name}
						onChange={(e) : void => setName(e.currentTarget.value)}
						width="100%"
					/>
				</div>
				<div>
					<span>Icon</span>
					<button
						onClick={async () : Promise<void> =>
							setIcon(await new ChooseIconModal(plugin).awaitSelection())
						}
					>
						<ObsidianIcon icon={icon} />
					</button>
				</div>
			</div>
			<div class="setting-item">
				<div>
					<label><input 
						type="checkbox" 
						checked={triggerWhenEnteringFullscreen}
						onChange={(e) : void => setTriggerWhenEnteringFullscreen(e.currentTarget.checked)}
					/> Trigger when entering full screen</label>
				</div>
				<div>
					<label><input 
						type="checkbox" 
						checked={triggerWhenExitingFullscreen}
						onChange={(e) : void => setTriggerWhenExitingFullscreen(e.currentTarget.checked)}
					/> Trigger when exiting full screen</label>
				</div>
			</div>

			{commands.map((item, idx) => {
				const command = getCommandFromId(item);
				return (
					<div class="setting-item cmdr-mm-item">
						<div>
							<button
								onClick={async (): Promise<void> => {
									const newId = await new AddCommandModal(plugin).awaitSelection();
									setCommands(commands.map((item, i) => (i === idx) ? newId.id : item));
								}}
							>
								{command?.name || "Cannot find Command"}
							</button>
						</div>
						<div>
							<div class="cmdr-mm-action-options">
								<ObsidianIcon
									class="clickable-icon"
									icon="arrow-down"
									onClick={() : void => {
										if (idx === commands.length - 1)
											return;
										const newCommands = [...commands];
										const temp = newCommands[idx];
										newCommands[idx] = newCommands[idx + 1];
										newCommands[idx + 1] = temp;
										setCommands(newCommands);
									}}
								/>
								<ObsidianIcon
									class="clickable-icon"
									icon="arrow-up"
									onClick={() : void => {
										if (idx === 0) return;
										const newCommands = [...commands];
										const temp = newCommands[idx];
										newCommands[idx] = newCommands[idx - 1];
										newCommands[idx - 1] = temp;
										setCommands(newCommands);
									}}
								/>
								<ObsidianIcon
									class="clickable-icon"
									icon="cross"
									onClick={() : void => {
										setCommands(commands.filter((_, i) => i !== idx));
									}}
								/>
							</div>
						</div>
					</div>
				);
			})}

			{commands.length < 2 && ( 
				<div className="setting-item cmdr-mm-actions cmdr-justify-between">
					<div>
						<button onClick={handleAddCommand}>Add Command</button>
					</div>
				</div>
			)}

			<div className="cmdr-mm-control">
				<button
					class={commands.length === 0 ? "disabled" : "mod-cta"}
					disabled={commands.length === 0}
					onClick={() : void  => {
						if (commands.length)
							onSave({ commands: commands, name, icon, nextCommandIndex, triggerWhenEnteringFullscreen, triggerWhenExitingFullscreen });
					}}
				>
					Save
				</button>
				<button onClick={onCancel}>Cancel</button>
			</div>
		</div>
	);
}
