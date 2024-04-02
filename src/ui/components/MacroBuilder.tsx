import { h } from "preact";
import { useState } from "preact/hooks";
import CommanderPlugin from "src/main";
import { Macro, Action, MacroItem } from "src/types";
import { getCommandFromId, ObsidianIcon } from "src/util";
import AddCommandModal from "../addCommandModal";
import ChooseIconModal from "../chooseIconModal";
import { SliderComponent } from "./settingComponent";

interface MacroBuilderProps {
	plugin: CommanderPlugin;
	macro: Macro;
	onSave: (macro: Macro) => void;
	onCancel: () => void;
}
export default function ({
	plugin,
	macro,
	onSave,
	onCancel,
}: MacroBuilderProps): h.JSX.Element {
	const [name, setName] = useState(macro.name || "Macro Name");
	const [icon, setIcon] = useState(macro.icon || "star");
	const [startup, setStartup] = useState(macro.startup || false);
	const [enterFullscreen, setEnterFullscreen] = useState(macro.enterFullscreen || false);
	const [exitFullscreen, setExitFullscreen] = useState(macro.exitFullscreen || false);
	const [stepByStep, setStepByStep] = useState(macro.stepByStep || false);
	const [macroCommands, setMacroCommands] = useState<MacroItem[]>(
		JSON.parse(JSON.stringify(macro.macro)) || []
	);

	const forceUpdate = this.forceUpdate.bind(this);

	const handleAddCommand = async () => {
		const command = await new AddCommandModal(plugin).awaitSelection();
		if (command) {
			setMacroCommands([
				...macroCommands,
				{ action: Action.COMMAND, commandId: command.id },
			]);
		}
	};

	const handleAddDelay = async () => {
		setMacroCommands([
			...macroCommands,
			{ action: Action.DELAY, delay: 250 },
		]);
	};

	return (
		<div>
			<div class="setting-item cmdr-mm-item">
				<div>
					<span>Name</span>
					<input
						type="text"
						placeholder="Macro Name"
						value={name}
						onChange={(e) => setName(e.currentTarget.value)}
						width="100%"
					/>
				</div>
				<div>
					<span>Icon</span>
					<button
						onClick={async () =>
							setIcon(
								await new ChooseIconModal(
									plugin
								).awaitSelection()
							)
						}
					>
						<ObsidianIcon icon={icon} />
					</button>
				</div>
			</div>

			<div className="setting-item cmrd-mm-checkboxes">
				<div>
					<input
						type="checkbox"
						id="checkbox-step-by-step"
						checked={stepByStep}
						onChange={({ target }) => {
							//@ts-expect-error
							setStepByStep(target?.checked ?? false);
						}}
					/>
					<label htmlFor="checkbox-step-by-step">Execute just one step sequentially for each run</label>
				</div>
				<div>
					<input
						type="checkbox"
						id="checkbox-startup"
						checked={startup}
						onChange={({ target }) => {
							//@ts-expect-error
							setStartup(target?.checked ?? false);
						}}
					/>
					<label htmlFor="checkbox-startup">Auto-run on startup</label>
				</div>
				<div>
					<input
						type="checkbox"
						id="checkbox-enter-fullscreen"
						checked={enterFullscreen}
						onChange={({ target }) => {
							//@ts-expect-error
							setEnterFullscreen(target?.checked ?? false);
						}}
					/>
					<label htmlFor="checkbox-enter-fullscreen">Auto-run on entering fullscreen</label>
				</div>
				<div>
					<input
						type="checkbox"
						id="checkbox-exit-fullscreen"
						checked={exitFullscreen}
						onChange={({ target }) => {
							//@ts-expect-error
							setExitFullscreen(target?.checked ?? false);
						}}
					/>
					<label htmlFor="checkbox-exit-fullscreen">Auto-run on exiting fullscreen</label>
				</div>
			</div>

			{macroCommands.map((item, idx) => {
				switch (item.action) {
					case Action.COMMAND:
						const command = getCommandFromId(item.commandId);
						return (
							<div class="setting-item cmdr-mm-item">
								<div>
									<button
										onClick={async (): Promise<void> => {
											const newId =
												await new AddCommandModal(
													plugin
												).awaitSelection();
											setMacroCommands(
												macroCommands.map((item, i) => {
													if (i === idx) {
														return {
															...item,
															commandId: newId.id,
														};
													}
													return item;
												})
											);
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
											onClick={() => {
												if (
													idx ===
													macroCommands.length - 1
												)
													return;
												const newCommands = [
													...macroCommands,
												];
												const temp = newCommands[idx];
												newCommands[idx] =
													newCommands[idx + 1];
												newCommands[idx + 1] = temp;
												setMacroCommands(newCommands);
											}}
										/>
										<ObsidianIcon
											class="clickable-icon"
											icon="arrow-up"
											onClick={() => {
												if (idx === 0) return;
												const newCommands = [
													...macroCommands,
												];
												const temp = newCommands[idx];
												newCommands[idx] =
													newCommands[idx - 1];
												newCommands[idx - 1] = temp;
												setMacroCommands(newCommands);
											}}
										/>
										<ObsidianIcon
											class="clickable-icon"
											icon="cross"
											onClick={() => {
												setMacroCommands(
													macroCommands.filter(
														(_, i) => i !== idx
													)
												);
											}}
										/>
									</div>
								</div>
							</div>
						);
					case Action.DELAY:
						return (
							<div class="setting-item cmdr-mm-item">
								<div>
									<SliderComponent
										name="Delay"
										min={0}
										max={10000}
										step={50}
										description="Delay in milliseconds"
										value={item.delay}
										changeHandler={(value) =>
											(item.delay = value)
										}
									/>
								</div>
								<div>
									<div class="cmdr-mm-action-options">
										<ObsidianIcon
											class="clickable-icon"
											icon="arrow-down"
											onClick={() => {
												if (
													idx ===
													macroCommands.length - 1
												)
													return;
												const newCommands = [
													...macroCommands,
												];
												const temp = newCommands[idx];
												newCommands[idx] =
													newCommands[idx + 1];
												newCommands[idx + 1] = temp;
												setMacroCommands(newCommands);
											}}
										/>
										<ObsidianIcon
											class="clickable-icon"
											icon="arrow-up"
											onClick={() => {
												if (idx === 0) return;
												const newCommands = [
													...macroCommands,
												];
												const temp = newCommands[idx];
												newCommands[idx] =
													newCommands[idx - 1];
												newCommands[idx - 1] = temp;
												setMacroCommands(newCommands);
											}}
										/>
										<ObsidianIcon
											class="clickable-icon"
											icon="cross"
											onClick={() => {
												setMacroCommands(
													macroCommands.filter(
														(_, i) => i !== idx
													)
												);
											}}
										/>
									</div>
								</div>
							</div>
						);
					case Action.EDITOR:
						return <div>Editor: {item.action}</div>;
					case Action.LOOP:
						return <div>Loop: {item.times}</div>;
				}
			})}

			<div className="setting-item cmdr-mm-actions cmdr-justify-between">
				<div>
					<button onClick={handleAddCommand}>Add Command</button>
					<button onClick={handleAddDelay}>Add Delay</button>
				</div>
				{/* <button>Add Editor Command</button>
			<button>Add loop</button> */}
			</div>

			<div className="cmdr-mm-control">
				<button
					class={macroCommands.length === 0 ? "disabled" : "mod-cta"}
					disabled={macroCommands.length === 0}
					onClick={() =>
						macroCommands.length &&
						onSave({ macro: macroCommands, name, icon, startup, enterFullscreen, exitFullscreen, stepByStep })
					}
				>
					Save
				</button>
				<button onClick={onCancel}>Cancel</button>
			</div>
		</div>
	);
}
