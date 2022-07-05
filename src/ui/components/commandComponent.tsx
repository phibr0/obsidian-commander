import { Fragment, h } from "preact";
import { CommandIconPair } from "src/types";
import { getCommandFromId } from "src/util";
import ChangeableText from "./ChangeableText";
import { ObsidianIcon } from "src/util";
import t from "src/l10n";

interface CommandViewerProps {
	pair: CommandIconPair;
	handleRemove: () => void;
	handleUp: () => void;
	handleDown: () => void;
	handleNewIcon: () => void;
	// eslint-disable-next-line no-unused-vars
	handleRename: (name: string) => void;
	handleModeChange: () => void;
}

export default function CommandComponent({ pair, handleRemove, handleDown, handleUp, handleNewIcon, handleRename, handleModeChange }: CommandViewerProps): h.JSX.Element {
	const cmd = getCommandFromId(pair.id);
	if (!cmd) {
		// !TODO
		return <Fragment>Dead</Fragment>;
	}
	const owningPluginID = cmd.id.split(":").first();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const owningPlugin = app.plugins.manifests[owningPluginID!];
	const isInternal = !owningPlugin;
	const isChecked = cmd.hasOwnProperty("checkCallback") || cmd.hasOwnProperty("editorCheckCallback");

	const modeIcon = getModeIcon(pair.mode);
	const modeName = pair.mode.match(/desktop|mobile|any/) ? pair.mode[0].toUpperCase() + pair.mode.substring(1) : t("This device");

	return (
		<Fragment>
			<div className="setting-item">
				<ObsidianIcon icon={pair.icon} size={20} aria-label={t("Choose new")} onClick={handleNewIcon} className="cmdr-icon clickable-icon" />
				<div className="setting-item-info">
					<div className="setting-item-name">
						{/* @ts-ignore */}
						<ChangeableText handleChange={({ target }): void => handleRename(target?.value)} value={pair.name} />
						{pair.name !== cmd.name && <span style="margin-left: .8ex">({cmd.name})</span>}
					</div>
					<div className="setting-item-description">{t("Added by {{plugin_name}}.".replace("{{plugin_name}}", isInternal ? "Obsidian" : owningPlugin.name))} {isChecked ? t("Warning: This is a checked Command, meaning it might not run under every circumstance.") : ""}</div>
				</div>
				<div className="setting-item-control">
					<ObsidianIcon icon="arrow-down" className="setting-editor-extra-setting-button clickable-icon" onClick={handleDown} aria-label={t("Move down")} />
					<ObsidianIcon icon="arrow-up" className="setting-editor-extra-setting-button clickable-icon" onClick={handleUp} aria-label={t("Move up")} />
					<ObsidianIcon icon={modeIcon} className="setting-editor-extra-setting-button clickable-icon" onClick={handleModeChange} aria-label={t("Change Mode (Currently: {{current_mode}})").replace("{{current_mode}}", modeName)} />
					<button className="mod-warning" style="display: flex" onClick={handleRemove} aria-label={t("Delete")}>
						<ObsidianIcon icon="lucide-trash" />
					</button>
				</div>
			</div>
		</Fragment>
	);
}

function getModeIcon(mode: string): string {
	if (mode === "mobile") return "smartphone";
	if (mode === "desktop") return "monitor";
	if (mode === "any") return "paperclip";
	return "airplay";
}
