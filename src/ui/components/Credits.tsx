import { h } from "preact";
import { useState } from "preact/hooks";
import t from "src/l10n";

const links = [
	"https://github.com/jsmorabito",
	"https://github.com/phibr0",
	"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
];

export default function Credits(): h.JSX.Element {
	const [clicks, setClicks] = useState(0);

	return (
		<div className="cmdr-credits">
			<span
				onClick={(): void => {
					setClicks((c) => c + 1);
					location.replace(links[clicks % links.length]);
				}}
			>
				{t("By Johnny✨ and phibr0")}
			</span>
		</div>
	);
}
