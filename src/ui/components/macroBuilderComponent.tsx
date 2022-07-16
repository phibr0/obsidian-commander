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
					{ id: 'port-1', alignment: 'right' },
				],
				data: {
					foo: 'bar',
					count: 0,
				}
			},
			{
				id: 'node-2',
				content: 'Middle',
				coordinates: [400, 150],
				inputs: [
					{ id: 'port-3', alignment: 'left' },
					{ id: 'port-4', alignment: 'left' },
				],
				outputs: [
					{ id: 'port-5', alignment: 'right' },
					{ id: 'port-6', alignment: 'right' },
				],
			},
		],
		links: [
			{ input: 'port-1', output: 'port-4' },
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
