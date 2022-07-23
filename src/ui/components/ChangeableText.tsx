import { h } from "preact";
import { Ref, useEffect, useRef, useState } from "preact/hooks";

interface Props {
	value: string;
	// eslint-disable-next-line no-unused-vars
	handleChange: (e: Event) => void;
	ariaLabel: string;
}

export default function ChangeableText({
	value,
	handleChange,
	ariaLabel
}: Props): h.JSX.Element {
	const [showInputEle, setShowInput] = useState(false);
	const el: Ref<HTMLInputElement> | undefined = useRef(null);

	useEffect(() => {
		el?.current?.select();
		el?.current?.focus();
	});

	return (
		<div class="cmdr-editable">
			{showInputEle ? (
				<input
					type="text"
					value={value}
					onKeyDown={(e): void => {
						/* If Enter was pressed, handle the name change and set to display mode */
						if (
							e.key === "Enter" &&
							(e.target as HTMLInputElement).value.length > 0
						) {
							setShowInput(false);
							handleChange(e);
						}
					}}
					onBlur={(): void => setShowInput(false)}
					ref={el}
				/>
			) : (
				<span
					onDblClick={(): void => setShowInput(true)}
					aria-label={ariaLabel}
				>
					{value}
				</span>
			)}
		</div>
	);
}
