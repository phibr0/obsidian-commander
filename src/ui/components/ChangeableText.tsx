import { Fragment, h } from "preact";
import { useState } from "preact/hooks";

interface Props {
	value: string;
	// eslint-disable-next-line no-unused-vars
	handleChange: (e: Event) => void;
}

export default function ChangeableText({ value, handleChange }: Props): h.JSX.Element {
	const [showInputEle, setShowInput] = useState(false);

	return (
		<Fragment>
			{
				showInputEle ? (
					<input
						type="text"
						value={value}
						onChange={(e): void => {
							setShowInput(false);
							handleChange(e);
						}}
						onBlur={(): void => setShowInput(false)}
						autoFocus
					/>
				) : (
					<span onDblClick={(): void => setShowInput(true)} aria-label="Double click to rename">
						{value}
					</span>
				)
			}
		</Fragment>
	);
}
