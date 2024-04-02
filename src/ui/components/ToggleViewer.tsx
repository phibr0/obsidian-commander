import { Platform } from "obsidian";
import { Fragment, h } from "preact";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { Toggle } from "src/types";
import { ObsidianIcon, updateToggleCommands } from "src/util";
import ConfirmDeleteModal from "../confirmDeleteModal";
import Logo from "./Logo";
import ToggleBuilderModal from "./ToggleBuilderModal";

interface ToggleBuilderProps {
	plugin: CommanderPlugin;
	toggles: Toggle[];
}
export default function ToggleViewer({
	plugin,
	toggles,
}: ToggleBuilderProps): h.JSX.Element {
	const handleBuilder = (toggle: Toggle, idx?: number) : void => {
		const onClose = (updatedToggle: Toggle) : void => {
			toggles.splice(
				idx !== undefined ? idx : toggles.length,
				idx !== undefined ? 1 : 0,
				updatedToggle
			);

			plugin.saveSettings();
			this.forceUpdate();
			updateToggleCommands(plugin);
			modal.close();
		};
		const modal = new ToggleBuilderModal(plugin, toggle, onClose);
		modal.open();
	};

	const handleDelete = (idx: number) : void => {
		toggles.splice(idx, 1);
		plugin.saveSettings();
		this.forceUpdate();
		updateToggleCommands(plugin);
	};

	return (
		<Fragment>
			<div className="cmdr-sep-con">
				{toggles.map((item, idx) => (
					<div class="setting-item mod-toggle">
						<div className="setting-item-info">
							<div className="setting-item-name">{item.name}</div>
						</div>
						<div className="setting-item-control">
							<button
								aria-label="Edit Toggle"
								onClick={() : void => handleBuilder(item, idx)}
							>
								<ObsidianIcon icon="lucide-pencil" />
							</button>
							<button
								aria-label="Delete"
								class="mod-warning"
								onClick={async (): Promise<void> => {
									if (
										!plugin.settings.confirmDeletion ||
										(await new ConfirmDeleteModal(
											plugin
										).didChooseRemove())
									) {
										handleDelete(idx);
									}
								}}
							>
								<ObsidianIcon icon="trash" />
							</button>
						</div>
					</div>
				))}
			</div>
			{!toggles.length && (
				<div class="cmdr-commands-empty">
					{/* This isn't really dangerous,
					as the svg is inserted at build time and no other data can be passed to it */}
					<Logo />
					<h3>No Toggles yet!</h3>
					<span>{t("Would you like to add one now?")}</span>
				</div>
			)}

			{Platform.isMobile && <hr />}

			<div className="cmdr-add-new-wrapper">
				<button
					class="mod-cta"
					onClick={() : void  =>
						handleBuilder({ name: "", commands: [], nextCommandIndex: 0, icon: "star" })
					}
				>
					Add Toggle
				</button>
			</div>
		</Fragment>
	);
}
