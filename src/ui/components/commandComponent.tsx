import { setIcon } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { CommandIconPair } from "src/types";
import { getCommandFromId } from "src/util";

interface CommandViewerProps {
	pair: CommandIconPair;
	handleRemove: () => void;
	handleUp: () => void;
	handleDown: () => void;
}

export default function CommandComponent({ pair, handleRemove, handleDown, handleUp }: CommandViewerProps): h.JSX.Element {
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

	const cmdIcon = useRef<HTMLDivElement>(null);
	const upIcon = useRef<HTMLDivElement>(null);
	const downIcon = useRef<HTMLDivElement>(null);
	const deleteIcon = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		setIcon(cmdIcon.current!, pair.icon); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		setIcon(upIcon.current!, "arrow-up"); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		setIcon(downIcon.current!, "arrow-down"); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		setIcon(deleteIcon.current!, "lucide-trash"); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}, [pair.icon]);

	return (
		<Fragment>
			<div className="setting-item">
				<div ref={cmdIcon} className="cmdr-icon" />
				<div className="setting-item-info">
					<div className="setting-item-name">{pair.name === cmd.name ? (isInternal ? cmd.name : cmd.name.split(":").slice(1).join()) : `${pair.name} (${cmd.name})`}</div>
					<div className="setting-item-description">Added by {isInternal ? "Obsidian" : owningPlugin.name}. {isChecked ? "Warning: This is a checked Command, meaning it might not run under every circumstance." : ""}</div>
				</div>
				<div className="setting-item-control">
					<div className="setting-editor-extra-setting-button clickable-icon" ref={downIcon} onClick={handleDown} aria-label="Move down" />
					<div className="setting-editor-extra-setting-button clickable-icon" ref={upIcon} onClick={handleUp} aria-label="Move up" aria-label-position="top" />
					<button className="mod-warning" ref={deleteIcon} style="display: flex" onClick={handleRemove} aria-label="Delete" />
				</div>
			</div>
		</Fragment>
	);
}
