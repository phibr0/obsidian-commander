import { h } from "preact";
import { Ref, useEffect, useRef, useState } from "preact/hooks";

interface Props {
	value: string;
	// eslint-disable-next-line no-unused-vars
	handleChange: (e: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => void;
	ariaLabel: string;
}

export default function ChangeableText({
	value,
	handleChange,
	ariaLabel,
}: Props): h.JSX.Element {
	const [showInputEle, setShowInput] = useState(false);
	const el: Ref<HTMLInputElement> | undefined = useRef(null);
	const [width, setWidth] = useState<number>(0);

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
					style={{ width: width + 25 + "px" }}
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
					/* @ts-ignore */
					onDblClick={({ target }): void => {
						setWidth(target?.offsetWidth);
						setShowInput(true);
					}}
					aria-label={ariaLabel}
				>
					{value}
				</span>
			)}
		</div>
	);
}
