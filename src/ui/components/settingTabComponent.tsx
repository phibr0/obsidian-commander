import confetti from "canvas-confetti";
import { Notice } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import t from "src/l10n";
import { ObsidianIcon } from "src/util";
import CommanderPlugin from "../../main";
import CommandViewer from "./commandViewerComponent";
import HidingViewer from "./hidingViewer";
import { ToggleComponent } from "./settingComponent";

export default function settingTabComponent({ plugin, mobileMode }: { plugin: CommanderPlugin; mobileMode: boolean; }): h.JSX.Element {
	const [activeTab, setActiveTab] = useState(0);

	const tabToNextTab = ({ key, shiftKey }: KeyboardEvent): void => {
		if (shiftKey && key === "Tab") {
			if (activeTab > 0) {
				setActiveTab((activeTab - 1) % tabs.length);
			} else {
				setActiveTab(tabs.length - 1);
			}
		} else if (key === "Tab") {
			setActiveTab((activeTab + 1) % tabs.length);
		}
	};

	useEffect(() => {
		addEventListener("keydown", tabToNextTab);
		return () => removeEventListener("keydown", tabToNextTab);
	});

	const openHiderTab = (idx: number): void => {
		setActiveTab(tabs.length - 1);
		setTimeout(
			() => dispatchEvent(new CustomEvent("cmdr-open-hider-tab", { detail: { index: idx } })),
			50
		);
	};

	const tabs = useMemo(() => [
		{
			name: t("General"),
			tab: <Fragment>
				<ToggleComponent
					name={t("Always ask before removing?")}
					description={t("Always show a Popup to confirm deletion of a Command.")}
					value={plugin.settings.confirmDeletion}
					changeHandler={async (value): Promise<void> => {
						plugin.settings.confirmDeletion = !value;
						await plugin.saveSettings();
					}} />
				<ToggleComponent
					value={plugin.settings.showAddCommand}
					name={t("Show \"Add Command\" Button")}
					description={t("Show the \"Add Command\" Button in every Menu. Requires restart.")}
					changeHandler={async (value): Promise<void> => {
						plugin.settings.showAddCommand = !value;

						if (!plugin.settings.showAddCommand) {
							const elements = document.getElementsByClassName("cmdr-adder");
							const x: Element[] = [];
							for (let i = 0; i < elements.length; i++) {
								// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
								x.push(elements.item(i)!);
							}
							x.forEach((pre) => pre.remove());
						} else {
							new Notice(t("Please restart Obsidian for these changes to take effect."));
						}

						await plugin.saveSettings();
					}} />
				<ToggleComponent
					value={plugin.settings.debug}
					name={t("Enable debugging")}
					description={t("Enable console output.")}
					changeHandler={async (value): Promise<void> => {
						plugin.settings.debug = !value;
						await plugin.saveSettings();
					}} />
			</Fragment>
		},
		{
			name: t("Editor Menu"),
			tab: <CommandViewer manager={plugin.manager.editorMenu} plugin={plugin} onOpenHider={(): void => openHiderTab(2)} />
		},
		{
			name: t("File Menu"),
			tab: <CommandViewer manager={plugin.manager.fileMenu} plugin={plugin} onOpenHider={(): void => openHiderTab(3)} />
		},
		{
			name: t("Left Ribbon"),
			tab: <CommandViewer manager={plugin.manager.leftRibbon} plugin={plugin} onOpenHider={(): void => openHiderTab(0)} />
		},
		{
			name: t("Right Ribbon"),
			tab: <CommandViewer manager={plugin.manager.rightRibbon} plugin={plugin} />
		},
		{
			name: t("Titlebar"),
			tab: <CommandViewer manager={plugin.manager.titleBar} plugin={plugin} />
		},
		{
			name: t("Statusbar"),
			tab: <CommandViewer manager={plugin.manager.statusBar} plugin={plugin} onOpenHider={(): void => openHiderTab(1)} />
		},
		{
			name: t("Page Header"),
			tab: <CommandViewer manager={plugin.manager.pageHeader} plugin={plugin} />
		},
		{
			name: t("Hide Commands"),
			tab: <HidingViewer plugin={plugin} />
		}
	], []);

	return (
		<Fragment>
			<div className="cmdr-setting-title">
				<h1>{plugin.manifest.name}</h1>
				<ObsidianIcon
					icon="coffee"
					size={24}
					className="clickable-icon"
					aria-label={t("Support development")}
					aria-label-position="left"
					id="cmdr-coffee-btn"
					onClick={async ({ target }): Promise<void> => {
						const myCanvas = document.createElement('canvas');
						document.body.appendChild(myCanvas);
						myCanvas.style.position = "fixed";
						myCanvas.style.width = "100vw";
						myCanvas.style.height = "100vh";
						myCanvas.style.top = "0px";
						myCanvas.style.left = "0px";
						//@ts-ignore
						myCanvas.style["pointer-events"] = "none";
						//@ts-ignore
						myCanvas.style["z-index"] = "100";

						const myConfetti = confetti.create(myCanvas, {
							resize: true,
							useWorker: true
						});
						const pos = (target as HTMLDivElement).getBoundingClientRect();

						setTimeout(() => location.replace("https://buymeacoffee.com/phibr0"), Math.random() * 800 + 500);

						await myConfetti({
							particleCount: 150,
							spread: 120,
							angle: 200,
							drift: -1,
							origin: {
								x: pos.x / window.innerWidth,
								y: pos.y / window.innerHeight,
							},
						});

						myCanvas.remove();
					}}
				/>
			</div>
			<nav class={`cmdr-setting-header${mobileMode ? " cmdr-mobile" : ""}`}>
				{tabs.map((tab, idx) => <div
					className={activeTab === idx ? "cmdr-tab cmdr-tab-active" : "cmdr-tab"}
					onClick={(): void => setActiveTab(idx)}>
					{tab.name}
				</div>)}
				<div className="cmdr-fill" />
			</nav>
			<div class="cmdr-setting-content">
				{tabs[activeTab].tab}
			</div>
		</Fragment>
	);
}
