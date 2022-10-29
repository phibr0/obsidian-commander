import { h } from "preact";
import { useState } from "preact/hooks";
import t from "src/l10n";
import { ObsidianIcon } from "src/util";
import ChangeableText from "./ChangeableText";

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
	min?: number;
	max?: number;
	step?: number;
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

export function SliderComponent(props: SettingProps<number>): h.JSX.Element {
	const [val, setVal] = useState(props.value);

	return (
		<BaseComponent description={props.description} name={props.name} className="cmdr-slider">
			<div>
				<ChangeableText ariaLabel={t("Double click to enter custom value")} value={val.toString()} handleChange={({ target }): void => {
					//@ts-expect-error
					const n = Number(target.value);
					if (!isNaN(n) && val !== n) {
						setVal(n); props.changeHandler(n);
					}
				}} />
				{/*@ts-expect-error*/}
				<input class="slider" type="range" min={props.min ?? "0"} max={props.max ?? "32"} step={props.step ?? "1"} value={val} onPointerMove={({ target }): void => { if (val !== target.value) { setVal(target.value); props.changeHandler(target.value); } }} />
			</div>
		</BaseComponent>
	);
}
