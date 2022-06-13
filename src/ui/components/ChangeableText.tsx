import { h } from "preact";
import { useState } from "preact/hooks";

interface Props {
	value: string;
	handleChange: (e: Event) => void;
}

export default function ChangeableText({ value, handleChange }: Props): h.JSX.Element {
	const [showInputEle, setShowInput] = useState(false);

	return (
		<span>
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
		</span>
	);
}
