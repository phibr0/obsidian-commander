import { h } from "preact";
import { useState } from "preact/hooks";
import { ObsidianIcon } from "src/util";

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

interface EyeToggleSettingProps extends SettingProps<boolean> {
	hideLabel: string;
	showLabel: string;
}
export function EyeToggleComponent({ name, description, changeHandler, value, hideLabel, showLabel }: EyeToggleSettingProps): h.JSX.Element {
	const [state, setState] = useState(value);

	return (
		<BaseComponent name={name} description={description} className="mod-toggle">
			<ObsidianIcon
				aria-label={state ? showLabel : hideLabel}
				icon={state ? "eye-off" : "eye"}
				size={20}
				className="clickable-icon"
				onClick={(): void => { setState(!state); changeHandler(state); }}
			/>
		</BaseComponent>
	);
}
