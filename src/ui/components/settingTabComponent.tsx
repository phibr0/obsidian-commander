import { Notice, Platform } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import t from "src/l10n";
import { Tab } from "src/types";
import { ObsidianIcon, updateSpacing } from "src/util";
import CommanderPlugin from "../../main";
import About from "./About";
import CommandViewer from "./commandViewerComponent";
import { LeftRibbonHider, StatusbarHider } from "./hidingViewer";
import { SliderComponent, ToggleComponent } from "./settingComponent";

export default function settingTabComponent({ plugin, mobileMode }: { plugin: CommanderPlugin; mobileMode: boolean; }): h.JSX.Element {
	const [activeTab, setActiveTab] = useState(0);
	const [open, setOpen] = useState(true);

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
	}, [activeTab]);

	//This is used to remove the initial onclick event listener.
	if (Platform.isMobile) {
		useEffect(() => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const old_element = document.querySelector(".modal-setting-back-button")!;
			const new_element = old_element.cloneNode(true);
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			old_element.parentNode!.replaceChild(new_element, old_element);
			setOpen(true);
		}, []);
	}

	useEffect(() => {
		const el = document.querySelector<HTMLElement>(".modal-setting-back-button");
		if (!el) return;

		if (!open) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			el.lastChild!.textContent = tabs[activeTab].name;
			el.onclick = (): void => setOpen(true);
		} else {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			el.lastChild!.textContent = "Commander";
			el.onclick = (): void => app.setting.closeActiveTab();
		}
	}, [open]);

	const tabs: Tab[] = useMemo(() => [
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
							for (let i = elements.length - 1; i >= 0; i--) {
								elements.item(i)?.remove();
							}
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
				<SliderComponent
					value={plugin.settings.spacing}
					name={t("Choose custom spacing for Command Buttons")}
					description={t("Change the spacing between commands. You can set different values on mobile and desktop.")}
					changeHandler={async (value): Promise<void> => {
						updateSpacing(value);
						plugin.settings.spacing = value;
						await plugin.saveSettings();
					}} />
			</Fragment>
		},
		{
			name: t("Left Ribbon"),
			tab: <CommandViewer manager={plugin.manager.leftRibbon} plugin={plugin}>
				<LeftRibbonHider plugin={plugin} />
			</CommandViewer>
		},
		// {
		// 	name: t("Right Ribbon"),
		// 	tab: <CommandViewer manager={plugin.manager.rightRibbon} plugin={plugin} />
		// },
		{
			name: t("Page Header"),
			tab: <CommandViewer manager={plugin.manager.pageHeader} plugin={plugin}>
				<hr />
				<div className="cmdr-sep-con callout" data-callout="warning">
					<span className="cmdr-callout-warning"><ObsidianIcon icon="alert-circle" /> {t("Warning")}</span>
					<p className="cmdr-warning-description">{t("As of Obsidian 0.16.0 you need to explicitly enable the View Header.")}</p>
					<button onClick={(): void => {
						app.setting.openTabById("appearance");
						setTimeout(() => {
							//@ts-expect-error
							(app.setting.activeTab.containerEl as HTMLElement).scroll({
								behavior: "smooth",
								top: 250,
							});
							//@ts-expect-error
							(app.setting.activeTab.containerEl as HTMLElement).querySelectorAll(".setting-item-heading")[1].nextSibling.addClass("cmdr-cta");
						}, 50);
					}} className="mod-cta">{t("Open Appearance Settings")}</button>
				</div>
			</CommandViewer>
		},
		// {
		// 	name: t("Titlebar"),
		// 	tab: <CommandViewer manager={plugin.manager.titleBar} plugin={plugin} />
		// },
		{
			name: t("Statusbar"),
			tab: <CommandViewer manager={plugin.manager.statusBar} plugin={plugin}>
				<StatusbarHider plugin={plugin} />
			</CommandViewer>
		},
		{
			name: t("Editor Menu"),
			tab: <CommandViewer manager={plugin.manager.editorMenu} plugin={plugin} />
		},
		{
			name: t("File Menu"),
			tab: <CommandViewer manager={plugin.manager.fileMenu} plugin={plugin} />
		},
	], []);

	return (
		<Fragment>
			{Platform.isDesktop && <div className="cmdr-setting-title">
				<h1>{plugin.manifest.name}</h1>
			</div>}

			{(Platform.isDesktop || open) && <TabHeader tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} setOpen={setOpen} />}

			<div class={`cmdr-setting-content ${mobileMode ? "cmdr-mobile" : ""}`}>
				{(Platform.isDesktop || !open) && tabs[activeTab].tab}

				{((Platform.isMobile && open) || (Platform.isDesktop && activeTab === 0)) && <About manifest={plugin.manifest} />}
			</div>
		</Fragment >
	);
}

interface TabHeaderProps {
	tabs: Tab[],
	activeTab: number;
	// eslint-disable-next-line no-unused-vars
	setActiveTab: (idx: number) => void;
	// eslint-disable-next-line no-unused-vars
	setOpen: (open: boolean) => void;
}
export function TabHeader({ tabs, activeTab, setActiveTab, setOpen }: TabHeaderProps): h.JSX.Element {
	const wrapper = useRef<HTMLElement>(null);

	const handleScroll = (e: WheelEvent): void => {
		e.preventDefault();
		wrapper.current?.scrollBy({ left: e.deltaY > 0 ? 16 : -16 });
	};

	useEffect(() => {
		const el = wrapper.current;
		if (!el || Platform.isMobile) {
			return;
		}

		el.addEventListener("wheel", handleScroll);
		return () => el.removeEventListener("wheel", handleScroll);
	}, []);

	useEffect(() => document.querySelector(".cmdr-tab-active")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), [activeTab]);

	return (
		<nav class={`cmdr-setting-header ${Platform.isMobile ? "cmdr-mobile" : ""}`} ref={wrapper}>
			<div className="cmdr-setting-tab-group">
				{tabs.map((tab, idx) => <div
					className={activeTab === idx ? "cmdr-tab cmdr-tab-active" : "cmdr-tab"}
					onClick={(): void => { setActiveTab(idx); setOpen(false); }}>
					<span>{tab.name}</span>
					{Platform.isMobile && <ObsidianIcon icon="chevron-right" size={24} />}
				</div>)}
			</div>

			{Platform.isDesktop && <div className="cmdr-fill" />}
		</nav>
	);
}
