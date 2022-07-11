import { PluginManifest } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { updateHiderStylesheet } from "src/util";
import Closable from "./Closable";
import { ToggleComponent } from "./settingComponent";

export default function HidingViewer({ plugin }: { plugin: CommanderPlugin }): h.JSX.Element {
	return (
		<Fragment>
			<LeftRibbonHider plugin={plugin} />
			<StatusbarHider plugin={plugin} />
		</Fragment>
	);
}

function LeftRibbonHider({ plugin }: { plugin: CommanderPlugin }): h.JSX.Element {
	const [ribbonCommands, setRibbonCommands] = useState<{ name: string, icon: string }[]>([]);
	const hiddenCommands = plugin.settings.hide.leftRibbon;
	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		setRibbonCommands([...app.workspace.leftRibbon.ribbonActionsEl!.children].filter((el) => !el.hasClass("cmdr")).map((el) => { return { name: el.getAttribute("aria-label")!, icon: el.firstElementChild!.className! }; }));
	}, []);

	return (
		<Closable index={0} title={t("Left Ribbon")}>
			{ribbonCommands.map((command) => <ToggleComponent
				name={command.name}
				description=""
				changeHandler={async (value): Promise<void> => {
					if (!value) {
						hiddenCommands.push(command.name);
					} else {
						hiddenCommands.contains(command.name) && hiddenCommands.remove(command.name);
					}
					updateHiderStylesheet(plugin.settings);
					await plugin.saveSettings();
				}}
				value={hiddenCommands.contains(command.name)}
			/>)}
		</Closable>
	);
}

function StatusbarHider({ plugin }: { plugin: CommanderPlugin }): h.JSX.Element {
	const hiddenPlugins = plugin.settings.hide.statusbar;
	const [pluginsWithRibbonItems, setPluginsWithRibbonItems] = useState<PluginManifest[]>([]);
	useEffect(() => {
		const statusBarItems = [...app.statusBar.containerEl.getElementsByClassName("status-bar-item")];
		const ids = (statusBarItems.map(el => [...el.classList].find((pre) => pre.startsWith("plugin-"))).filter((pre) => pre) as string[]).map((pre) => pre.substring(7));
		setPluginsWithRibbonItems(ids.map((id) => app.plugins.manifests[id] || { id, name: id.replace(/-/g, " ").replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()), description: "Core Plugin" }));
	}, []);

	return (
		<Closable index={1} title={t("Statusbar")}>
			{pluginsWithRibbonItems.map((manifest) => <ToggleComponent
				name={manifest.name}
				description={manifest.description}
				value={hiddenPlugins.contains(manifest.id)}
				changeHandler={async (value): Promise<void> => {
					if (!value) {
						hiddenPlugins.push(manifest.id);
					} else {
						hiddenPlugins.contains(manifest.id) && hiddenPlugins.remove(manifest.id);
					}
					updateHiderStylesheet(plugin.settings);
					await plugin.saveSettings();
				}}
			/>)}
		</Closable>
	);
}
