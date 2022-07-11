import { Platform } from "obsidian";
import { Fragment, h } from "preact";
import t from "src/l10n";
import { CommandIconPair } from "src/types";
import { getCommandFromId, ObsidianIcon } from "src/util";
import ChangeableText from "./ChangeableText";

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

export default function CommandComponent({
	pair,
	handleRemove,
	handleDown,
	handleUp,
	handleNewIcon,
	handleRename,
	handleModeChange,
}: CommandViewerProps): h.JSX.Element {
	const cmd = getCommandFromId(pair.id);
	if (!cmd) {
		// !TODO
		return <Fragment>Command removed (todo)</Fragment>;
	}
	const owningPluginID = cmd.id.split(":").first();
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const owningPlugin = app.plugins.manifests[owningPluginID!];
	const isInternal = !owningPlugin;
	const isChecked =
		cmd.hasOwnProperty("checkCallback") ||
		cmd.hasOwnProperty("editorCheckCallback");

	const modeIcon = getModeIcon(pair.mode);
	const modeName = pair.mode.match(/desktop|mobile|any/)
		? pair.mode[0].toUpperCase() + pair.mode.substring(1)
		: t("This device");

	return (
		<Fragment>
			{Platform.isDesktop && (
				<div className="setting-item mod-toggle">
					<ObsidianIcon
						icon={pair.icon}
						size={20}
						aria-label={t("Choose new")}
						onClick={handleNewIcon}
						className="cmdr-icon clickable-icon"
					/>
					<div className="setting-item-info">
						<div className="setting-item-name">
							<ChangeableText
								handleChange={({ target }): void => {
									{/* @ts-ignore */ }
									handleRename(target?.value);
								}
								}
								value={pair.name}
							/>
							{pair.name !== cmd.name && (
								<span style="margin-left: .8ex">
									({cmd.name})
								</span>
							)}
						</div>
						<div className="setting-item-description">
							{t(
								"Added by {{plugin_name}}.".replace(
									"{{plugin_name}}",
									isInternal ? "Obsidian" : owningPlugin.name
								)
							)}{" "}
							{isChecked
								? t(
									"Warning: This is a checked Command, meaning it might not run under every circumstance."
								)
								: ""}
						</div>
					</div>
					<div className="setting-item-control">
						<ObsidianIcon
							icon="arrow-down"
							className="setting-editor-extra-setting-button clickable-icon"
							onClick={handleDown}
							aria-label={t("Move down")}
						/>
						<ObsidianIcon
							icon="arrow-up"
							className="setting-editor-extra-setting-button clickable-icon"
							onClick={handleUp}
							aria-label={t("Move up")}
						/>
						<ObsidianIcon
							icon={modeIcon}
							className="setting-editor-extra-setting-button clickable-icon"
							onClick={handleModeChange}
							aria-label={t(
								"Change Mode (Currently: {{current_mode}})"
							).replace("{{current_mode}}", modeName)}
						/>
						<button
							className="mod-warning"
							style="display: flex"
							onClick={handleRemove}
							aria-label={t("Delete")}
						>
							<ObsidianIcon icon="lucide-trash" />
						</button>
					</div>
				</div>
			)}

			{Platform.isMobile && (
				<div className="mobile-option-setting-item">
					<span
						className="mobile-option-setting-item-remove-icon"
						onClick={handleRemove}
					>
						<ObsidianIcon
							icon="minus-with-circle"
							size={22}
							style={{ color: "var(--text-error)" }}
						/>
					</span>
					<span className="mobile-option-setting-item-option-icon">
						<ObsidianIcon icon={pair.icon} size={22} />
					</span>
					<span className="mobile-option-setting-item-name">
						{pair.name}
						{pair.name !== cmd.name && (
							<span style="margin-left: .8ex">({cmd.name})</span>
						)}
					</span>
					<span className="mobile-option-setting-item-option-icon">
						<ObsidianIcon
							icon="arrow-down"
							className="clickable-icon"
							onClick={handleDown}
							aria-label={t("Move down")}
						/>
						<ObsidianIcon
							icon="arrow-up"
							className="clickable-icon"
							onClick={handleUp}
							aria-label={t("Move up")}
						/>
						<ObsidianIcon
							icon="three-horizontal-bars"
							className="clickable-icon"
						/>
					</span>
				</div>
			)}
		</Fragment>
	);
}

function getModeIcon(mode: string): string {
	if (mode === "mobile") return "smartphone";
	if (mode === "desktop") return "monitor";
	if (mode === "any") return "paperclip";
	return "airplay";
}
