import confetti from "canvas-confetti";
import { Platform } from "obsidian";
import { h } from "preact";
import t from "src/l10n";
import { ObsidianIcon } from "src/util";

export default function Credits(): h.JSX.Element {
	return (
		<div className="cmdr-credits">
			<span>by Johnny✨ and phibr0</span>
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
						particleCount: Platform.isDesktop ? 150 : 80,
						startVelocity: Platform.isDesktop ? 45 : 55,
						spread: Platform.isDesktop ? 120 : 75,
						angle: Platform.isDesktop ? 200 : 100,
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
	);
}
