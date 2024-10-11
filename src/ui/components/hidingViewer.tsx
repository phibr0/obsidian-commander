import { PluginManifest } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import t from "src/l10n";
import CommanderPlugin from "src/main";
import { updateHiderStylesheet } from "src/util";
import Accordion from "./Accordion";
import { EyeToggleComponent } from "./settingComponent";

export function LeftRibbonHider({
	plugin,
}: {
	plugin: CommanderPlugin;
}): h.JSX.Element {
	const [ribbonCommands, setRibbonCommands] = useState<
		{ name: string; icon: string }[]
	>([]);
	const hiddenCommands = plugin.settings.hide.leftRibbon;
	useEffect(() => {
		setRibbonCommands(
			// @ts-expect-error
			app.workspace.leftRibbon.items.map((item) => ({
				name: item.title,
				icon: item.icon,
			}))
		);
	}, []);

	return (
		<Fragment>
			<hr />
			<Accordion title={t("Hide other Commands")}>
				{ribbonCommands.map((command) => (
					<EyeToggleComponent
						name={command.name}
						description=""
						hideLabel={t("Hide")}
						showLabel={t("Show")}
						changeHandler={async (value): Promise<void> => {
							if (!value) {
								hiddenCommands.push(command.name);
							} else {
								hiddenCommands.contains(command.name) &&
									hiddenCommands.remove(command.name);
							}
							updateHiderStylesheet(plugin.settings);
							await plugin.saveSettings();
						}}
						value={hiddenCommands.contains(command.name)}
					/>
				))}
			</Accordion>
		</Fragment>
	);
}

export function StatusbarHider({
	plugin,
}: {
	plugin: CommanderPlugin;
}): h.JSX.Element {
	const hiddenPlugins = plugin.settings.hide.statusbar;
	const [pluginsWithRibbonItems, setPluginsWithRibbonItems] = useState<
		PluginManifest[]
	>([]);
	useEffect(() => {
		const statusBarItems = [
			...plugin.app.statusBar.containerEl.getElementsByClassName(
				"status-bar-item"
			),
		];
		const ids = (
			statusBarItems
				.map((el) =>
					[...el.classList].find((pre) => pre.startsWith("plugin-"))
				)
				.filter((pre) => pre) as string[]
		).map((pre) => pre.substring(7));
		setPluginsWithRibbonItems(
			ids.map(
				(id) =>
					plugin.app.plugins.manifests[id] || {
						id,
						name: id
							.replace(/-/g, " ")
							.replace(/(^\w{1})|(\s+\w{1})/g, (letter) =>
								letter.toUpperCase()
							),
						description: "Core Plugin",
					}
			)
		);
	}, []);

	return (
		<Fragment>
			<hr />
			<Accordion title={t("Hide other Commands")}>
				{pluginsWithRibbonItems.map((manifest) => (
					<EyeToggleComponent
						name={manifest.name}
						description={manifest.description}
						value={hiddenPlugins.contains(manifest.id)}
						hideLabel={t("Hide")}
						showLabel={t("Show")}
						changeHandler={async (value): Promise<void> => {
							if (!value) {
								hiddenPlugins.push(manifest.id);
							} else {
								hiddenPlugins.contains(manifest.id) &&
									hiddenPlugins.remove(manifest.id);
							}
							updateHiderStylesheet(plugin.settings);
							await plugin.saveSettings();
						}}
					/>
				))}
			</Accordion>
		</Fragment>
	);
}
