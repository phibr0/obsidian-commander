import { createContext, Fragment, h } from "preact";
import CommanderPlugin from "src/main";
import CommandComponent from "./commandComponent";
import logo from "src/assets/commander-logo.svg";
import CommandManager from "src/manager/_commandManager";
import { chooseNewCommand, isModeActive, ObsidianIcon } from "src/util";
import { arrayMoveMutable } from "array-move";
import ChooseIconModal from "../chooseIconModal";
import ConfirmDeleteModal from "../confirmDeleteModal";
import t from "src/l10n";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const ManagerContext = createContext<CommandManager>(null!);

interface CommandViewerProps {
	manager: CommandManager;
	plugin: CommanderPlugin
	onOpenHider?: () => void
}
export default function CommandViewer({ manager, plugin, onOpenHider }: CommandViewerProps): h.JSX.Element {
	return (
		<Fragment>
			<ManagerContext.Provider value={manager}>
				{manager.pairs.map((cmd, idx) => {
					if (cmd.mode.match(/desktop|mobile|any/) || cmd.mode === app.appId) {
						return <CommandComponent
							key={cmd.id}
							pair={cmd}
							handleRemove={async (): Promise<void> => {
								if (!plugin.settings.confirmDeletion || await new ConfirmDeleteModal(plugin).didChooseRemove()) {
									await manager.removeCommand(cmd); this.forceUpdate();
								}
							}}
							handleUp={(): void => { arrayMoveMutable(manager.pairs, idx, idx - 1); manager.reorder(); this.forceUpdate(); }}
							handleDown={(): void => { arrayMoveMutable(manager.pairs, idx, idx + 1); manager.reorder(); this.forceUpdate(); }}
							handleRename={async (name): Promise<void> => { cmd.name = name; await plugin.saveSettings(); manager.reorder(); this.forceUpdate(); }}
							handleNewIcon={async (): Promise<void> => {
								const newIcon = await (new ChooseIconModal(plugin)).awaitSelection();
								if (newIcon && newIcon !== cmd.icon) {
									cmd.icon = newIcon;
									await plugin.saveSettings();
									manager.reorder();
									this.forceUpdate();
								}
							}}
							handleModeChange={async (): Promise<void> => {
								// This is the rotation
								const modes = ["any", "desktop", "mobile", app.appId];
								let currentIdx = modes.indexOf(cmd.mode);
								if (currentIdx === 3) currentIdx = -1;

								cmd.mode = modes[currentIdx + 1];
								await plugin.saveSettings();
								manager.reorder();
								this.forceUpdate();
							}}
						/>;
					}
				})}
				{!manager.pairs.some((pre) => isModeActive(pre.mode) || pre.mode.match(/mobile|desktop/)) && <div class="cmdr-commands-empty">
					{/* This isn't really dangerous,
					as the svg is inserted at build time and no other data can be passed to it */}
					<div class="cmdr-icon-wrapper" dangerouslySetInnerHTML={{ __html: logo }} />
					<h3>{t("No commands here!")}</h3>
					<span>{t("Would you like to add one now?")}</span>
				</div>}

				<div className="cmdr-add-new-wrapper">
					<button
						className="mod-cta"
						onClick={async (): Promise<void> => {
							const pair = await chooseNewCommand(plugin);
							await manager.addCommand(pair);
							manager.reorder();
							this.forceUpdate();
						}}
					>
						{t("Add command")}
					</button>

					{onOpenHider && <ObsidianIcon
						icon="eye-off"
						size={18}
						class="clickable-icon"
						aria-label={t("Hide Commands of other Plugins")}
						onClick={onOpenHider}
					/>}
				</div>
			</ManagerContext.Provider>
		</Fragment >
	);
}
