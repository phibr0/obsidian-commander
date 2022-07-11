import { h } from "preact";
import { useState } from "preact/hooks";

interface BaseComponentProps {
	children: h.JSX.Element;
	name: string;
	description: string;
	className?: string;
}
function BaseComponent({ name, description, children, className }: BaseComponentProps): h.JSX.Element {
	return (
		<div className={`setting-item ${className}`}>
			<div className="setting-item-info">
				<div className="setting-item-name">{name}</div>
				<div className="setting-item-description">{description}</div>
			</div>
			<div className="setting-item-control">
				{children}
			</div>
		</div>
	);
}

interface SettingProps<T> {
	name: string;
	description: string;
	// eslint-disable-next-line no-unused-vars
	changeHandler: (value: T) => void;
	value: T;
}
export function ToggleComponent(props: SettingProps<boolean>): h.JSX.Element {
	const [state, setState] = useState(props.value);

	return (
		<BaseComponent name={props.name} description={props.description} className="mod-toggle">
			<div
				className={`checkbox-container ${state ? "is-enabled" : ""}`}
				onClick={(): void => { setState(!state); props.changeHandler(state); }}
			/>
		</BaseComponent>
	);
}
