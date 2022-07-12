import { Platform, PluginManifest } from "obsidian";
import { h } from "preact";
import { showConfetti, ObsidianIcon } from "src/util";
import Credits from "./Credits";
import Logo from "./Logo";

export default function About({ manifest }: { manifest: PluginManifest }): h.JSX.Element {
	const feedbackBtn = <button onClick={(e): void => { showConfetti(e); setTimeout(() => location.replace("https://forms.gle/hPjn61G9bqqFb3256"), Math.random() * 800 + 500); }}><ObsidianIcon icon="message-square" size={20} /> Leave Feedback</button>;
	const donateBtn = <button onClick={(e): void => { showConfetti(e); setTimeout(() => location.replace("https://buymeacoffee.com/phibr0"), Math.random() * 800 + 500); }}><ObsidianIcon icon="coffee" size={20} />Support Development</button>;
	return (
		<div className="cmdr-about">
			{Platform.isMobile && [<hr />, feedbackBtn, donateBtn]}
			{Platform.isDesktop && [
				<div className="setting-item mod-toggle" style={{ width: "100%", borderTop: "1px solid var(--background-modifier-border)", paddingTop: "18px" }}>
					<div className="setting-item-info">
						<div className="setting-item-name">Leave Feedback</div>
						<div className="setting-item-description">Share feedback, issues, and ideas with our feedback form.</div>
					</div>
					<div className="setting-item-control">
						{feedbackBtn}
					</div>
				</div>,
				<div className="setting-item mod-toggle" style={{ width: "100%" }}>
					<div className="setting-item-info">
						<div className="setting-item-name">Donate</div>
						<div className="setting-item-description">Consider donating to support development.</div>
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
