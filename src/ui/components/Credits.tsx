import { h } from "preact";
import t from "src/l10n";

export default function Credits(): h.JSX.Element {
	return (
		<div className="cmdr-credits">
			<span>{t("By Johnny✨ and phibr0")}</span>
		</div>
	);
}
