import { h } from "preact";
import { memo } from "preact/compat";
import logo from "src/assets/commander-logo.svg";
import christmasLogo from "src/assets/commander-logo-christmas.svg";
import halloweenLogo from "src/assets/commander-logo-halloween.svg";
import { moment } from "obsidian";

const specialLogos: { [month: number]: string } = {
	9: halloweenLogo,
	11: christmasLogo,
};

function Logo(): h.JSX.Element {
	return (
		<div
			class="cmdr-icon-wrapper"
			dangerouslySetInnerHTML={{
				__html: specialLogos[moment().month()] ?? logo,
			}}
		/>
	);
}

export default memo(Logo);
