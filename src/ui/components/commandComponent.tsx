import { setIcon } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { CommandIconPair } from "src/types";
import { getCommandFromId } from "src/util";
import ChangeableText from "./ChangeableText";

interface CommandViewerProps {
	pair: CommandIconPair;
	handleRemove: () => void;
	handleUp: () => void;
	handleDown: () => void;
	handleNewIcon: () => void;
	// eslint-disable-next-line no-unused-vars
	handleRename: (name: string) => void;
}

export default function CommandComponent({ pair, handleRemove, handleDown, handleUp, handleNewIcon, handleRename }: CommandViewerProps): h.JSX.Element {
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
		setIcon(cmdIcon.current!, pair.icon, 20); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		setIcon(upIcon.current!, "arrow-up"); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		setIcon(downIcon.current!, "arrow-down"); // eslint-disable-line @typescript-eslint/no-non-null-assertion
		setIcon(deleteIcon.current!, "lucide-trash"); // eslint-disable-line @typescript-eslint/no-non-null-assertion
	}, [pair.icon]);

	return (
		<Fragment>
			<div className="setting-item">
				<div ref={cmdIcon} className="cmdr-icon clickable-icon" aria-label="Choose new" onClick={handleNewIcon} />
				<div className="setting-item-info">
					<div className="setting-item-name">
						{/* @ts-ignore */}
						<ChangeableText handleChange={({ target }): void => handleRename(target?.value)} value={pair.name} />
						{pair.name !== cmd.name && <span style="margin-left: .8ex">({cmd.name})</span>}
					</div>
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
