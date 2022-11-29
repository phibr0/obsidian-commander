import { ComponentProps, h } from "preact";
import { useState } from "preact/hooks";
import { ObsidianIcon } from "src/util";

interface AccordionProps extends ComponentProps<"details"> {
	title: string;
	children: h.JSX.Element | h.JSX.Element[];
}
export default function Accordion({
	title,
	children,
}: AccordionProps): h.JSX.Element {
	const [open, setOpen] = useState(false);

	const toggleHandler = (): void => {
		setOpen(!open);
	};

	return (
		<div className="cmdr-accordion cmdr-sep-con" aria-expanded={open}>
			<div className="cmdr-accordion-header" onClick={toggleHandler}>
				<ObsidianIcon
					className="cmdr-accordion-chevron clickable-icon"
					icon="chevron-down"
					size={24}
				/>
				<span>{title}</span>
			</div>
			<div
				className="cmdr-accordion-content"
				style={{ maxHeight: [children].flat().length * 120 + "px" }}
			>
				{children}
			</div>
		</div>
	);
}
