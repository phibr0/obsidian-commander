import { ComponentProps, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { ObsidianIcon } from "src/util";

interface ClosableProps extends ComponentProps<"details"> {
	title: string;
	index: number;
	children?: h.JSX.Element | h.JSX.Element[];
}
export default function Closable({ title, children, index }: ClosableProps): h.JSX.Element {
	const [open, setOpen] = useState(false);

	const toggleHandler = (): void => {
		setOpen(!open);
	};

	useEffect(() => {
		const handle = (e: CustomEvent): void => {
			if (e.detail.index === index) {
				setOpen(true);
			}
		};
		addEventListener("cmdr-open-hider-tab", handle);

		return () => removeEventListener("cmdr-open-hider-tab", handle);
	}, [index]);

	return (
		<div className="cmdr-accordion" aria-expanded={open}>
			<div className="cmdr-accordion-header" onClick={toggleHandler}>
				<span>{title}</span>
				<ObsidianIcon className="cmdr-accordion-chevron clickable-icon" icon="chevron-down" size={24} />
			</div>
			<div className="cmdr-accordion-content">
				{children}
			</div>
		</div>
	);
}
