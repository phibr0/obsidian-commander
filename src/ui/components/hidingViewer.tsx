import { Fragment, h } from "preact";
import { useMemo } from "preact/hooks";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import Closable from "./Closable";

// eslint-disable-next-line no-unused-vars
export default function HidingViewer({ plugin }: { plugin: CommanderPlugin }): h.JSX.Element {
	const tabs = useMemo(() => [
		<Closable title={t("Left Ribbon")} index={0}></Closable>,
		<Closable title={t("Statusbar")} index={1}></Closable>,
		<Closable title={t("Editor Menu")} index={2}></Closable>,
		<Closable title={t("File Menu")} index={3}></Closable>,
	], []);

	return (
		<Fragment>
			{tabs}
		</Fragment>
	);
}
