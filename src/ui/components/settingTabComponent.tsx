import { setIcon } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import CommanderPlugin from "../../main";
import CommandViewer from "./commandViewerComponent";
import { ToggleComponent } from "./settingComponent";
import confetti from "canvas-confetti";

export default function settingTabComponent({ plugin }: { plugin: CommanderPlugin; }): h.JSX.Element {
	const [activeTab, setActiveTab] = useState(0);
	const coffeeIcon = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		setIcon(coffeeIcon.current!, "coffee", 24);
	}, []);

	const tabs = [
		{
			name: "General",
			tab: <Fragment>
				<ToggleComponent
					name="Always ask before removing?"
					description="Always show a Popup to confirm deletion of a Command."
					value={plugin.settings.confirmDeletion}
					changeHandler={async (value): Promise<void> => {
						plugin.settings.confirmDeletion = !value;
						await plugin.saveSettings();
					}} />
				<ToggleComponent
					value={plugin.settings.showAddCommand}
					name='Show "Add Command" Button'
					description='Show the "Add Command" Button in every Menu.'
					changeHandler={async (value): Promise<void> => {
						plugin.settings.showAddCommand = !value;
						await plugin.saveSettings();
					}} />
				<ToggleComponent
					value={plugin.settings.debug}
					name='Enable debugging'
					description='Enable console output.'
					changeHandler={async (value): Promise<void> => {
						plugin.settings.debug = !value;
						await plugin.saveSettings();
					}} />
			</Fragment>
		},
		{
			name: "Editor Menu",
			tab: <CommandViewer manager={plugin.manager.editorMenu} plugin={plugin} />
		},
		{
			name: "File Menu",
			tab: <CommandViewer manager={plugin.manager.fileMenu} plugin={plugin} />
		},
		{
			name: "Left Ribbon",
			tab: <CommandViewer manager={plugin.manager.leftRibbon} plugin={plugin} />
		},
		{
			name: "Right Ribbon",
			tab: <CommandViewer manager={plugin.manager.rightRibbon} plugin={plugin} />
		},
		{
			name: "Titlebar",
			tab: <CommandViewer manager={plugin.manager.titleBar} plugin={plugin} />
		},
		{
			name: "Statusbar",
			tab: <CommandViewer manager={plugin.manager.statusBar} plugin={plugin} />
		},
		{
			name: "Page Header",
			tab: <CommandViewer manager={plugin.manager.pageHeader} plugin={plugin} />
		}
	];

	return (
		<Fragment>
			<div className="cmdr-setting-title">
				<h1>Commander 🎛️</h1>
				<div
					className="clickable-icon"
					ref={coffeeIcon}
					aria-label="Support development"
					aria-label-position="left"
					id="cmdr-coffee-btn"
					onClick={async (): Promise<void> => {
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
						const pos = coffeeIcon.current!.getBoundingClientRect();

						// eslint-disable-next-line @typescript-eslint/no-var-requires
						setTimeout(() => require('electron').shell.openExternal("https://buymeacoffee.com/phibr0"), 800);

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
			<nav class="cmdr-setting-header">
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
