import { Platform, PluginManifest } from "obsidian";
import { h } from "preact";
import t from "src/l10n";
import { showConfetti, ObsidianIcon } from "src/util";
import Credits from "./Credits";
import Logo from "./Logo";

export default function About({ manifest }: { manifest: PluginManifest }): h.JSX.Element {
	const feedbackBtn = <button className="mod-cta" onClick={(e): void => { showConfetti(e); setTimeout(() => location.replace("https://forms.gle/hPjn61G9bqqFb3256"), Math.random() * 800 + 500); }}><ObsidianIcon icon="message-square" size={20} />{t("Leave feedback")}</button>;
	const donateBtn = <button className="mod-cta" onClick={(e): void => { showConfetti(e); setTimeout(() => location.replace("https://ko-fi.com/phibr0"), Math.random() * 800 + 500); }}><ObsidianIcon icon="coffee" size={20} />{t("Support development")}</button>;
	return (
		<div className="cmdr-about">
			{Platform.isMobile && [<hr />, feedbackBtn, donateBtn]}
			{Platform.isDesktop && [
				<div className="setting-item mod-toggle" style={{ width: "100%", borderTop: "1px solid var(--background-modifier-border)", paddingTop: "18px" }}>
					<div className="setting-item-info">
						<div className="setting-item-name">{t("Leave feedback")}</div>
						<div className="setting-item-description">{t("Share feedback, issues, and ideas with our feedback form.")}</div>
					</div>
					<div className="setting-item-control">
						{feedbackBtn}
					</div>
				</div>,
				<div className="setting-item mod-toggle" style={{ width: "100%" }}>
					<div className="setting-item-info">
						<div className="setting-item-name">{t("Donate")}</div>
						<div className="setting-item-description">{t("Consider donating to support development.")}</div>
					</div>
					<div className="setting-item-control">
						{donateBtn}
					</div>
				</div>,
				<hr />
			]}
			<Logo />
			<b>{manifest.name}</b>
			<Credits />
			<span className="cmdr-version">{manifest.version}</span>
		</div>
	);
}
