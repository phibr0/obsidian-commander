import { Fragment, h } from "preact";
import { ObsidianIcon } from "src/util";
import Diagram, { createSchema, useSchema } from 'beautiful-react-diagrams';
import { useEffect } from "preact/hooks";

interface BaseComponentProps {
	icon: string;
	description: string;
}
function BaseComponent({ icon, description }: BaseComponentProps): h.JSX.Element {
	return (
		<div className="cmdr-base-component">
			<div className="cmdr-macro-icon">
				<ObsidianIcon icon={icon} />
			</div>
			<div className="cmdr-macro-description">
				{description}
			</div>
		</div>
	);
}

export default function MacroBuilder(): h.JSX.Element {

	const initialSchema = createSchema({
		nodes: [
			{
				id: 'node-1',
				content: <BaseComponent description="Start of your macro" icon="arrow-right" /> as React.ReactNode,
				coordinates: [100, 150],
				outputs: [
					{ id: 'node-1-out', alignment: 'right' },
				],
				disableDrag: true,
				data: {
					foo: 'bar',
					count: 0,
				}
			},
			{
				id: 'node-2',
				content: 'Wait x ms',
				coordinates: [400, 150],
				inputs: [
					{ id: 'node-2-in', alignment: 'left' },
				],
				outputs: [
					{ id: 'node-2-out', alignment: 'right' },
				],
			},
			{
				id: 'node-3',
				content: 'Type "something" in the active editor',
				coordinates: [700, 150],
				inputs: [
					{ id: 'node-3-in', alignment: 'left' },
				],
				outputs: [
					{ id: 'node-3-out', alignment: 'right' },
				],
			},
			{
				id: 'node-4',
				content: 'run command "Save current File"',
				coordinates: [1000, 150],
				inputs: [
					{ id: 'node-4-in', alignment: 'left' },
				],
				outputs: [
					{ id: 'node-4-out', alignment: 'right' },
				],
			},
			{
				id: 'node-5',
				content: 'do the following x times',
				coordinates: [1000, 150],
				inputs: [
					{ id: 'node-5-in', alignment: 'left' },
				],
				outputs: [
					{ id: 'node-5-out', alignment: 'right' },
				],
			},
		],
		links: [
			{ output: "node-1-out", input: "node-2-in" },
			{ output: "node-2-out", input: "node-3-in" },
			{ output: "node-3-out", input: "node-4-in" },
		]
	});

	const [schema, { onChange }] = useSchema(initialSchema);

	useEffect(() => {
		console.log(schema.links);
	}, [schema.links]);

	return (
		<Fragment>
			<Diagram schema={schema} onChange={onChange} />
		</Fragment>
	);
}
