import { h } from "preact";
import logo from "src/assets/commander-logo.svg";

export default function Logo(): h.JSX.Element {
	return <div class="cmdr-icon-wrapper" dangerouslySetInnerHTML={{ __html: logo }} />;
}
