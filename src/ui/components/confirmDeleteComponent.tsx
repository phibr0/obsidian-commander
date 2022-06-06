import { Fragment, h } from "preact";
import ConfirmDeleteModal from "../confirmDeleteModal";

export function confirmDeleteComponent({ modal }: { modal: ConfirmDeleteModal; }): h.JSX.Element {
	return (
		<Fragment>
			<p>Are you sure you want to delete the Command?</p>
			<div className="modal-button-container">
				<button className="mod-warning" onClick={async (): Promise<void> => {
					modal.plugin.settings.confirmDeletion = false;
					modal.plugin.saveSettings();

					modal.remove = true;
					modal.close();
				}}>
					Remove and don't ask again
				</button>
				<button className="mod-warning" onClick={(): void => {
					modal.remove = true;
					modal.close();
				}}>
					Remove
				</button>
				<button onClick={(): void => {
					modal.remove = false;
					modal.close();
				}}>
					Cancel
				</button>
			</div>
		</Fragment>
	);
}
