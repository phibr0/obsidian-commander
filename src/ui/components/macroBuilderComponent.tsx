import { setIcon } from "obsidian";
import { Fragment, h } from "preact";
import { useEffect, useRef, useState, } from "preact/hooks";
import ReactFlow, { useEdgesState, useNodesState, Background, Edge, ReactFlowProvider, addEdge } from 'react-flow-renderer/nocss';
import chroma from "chroma-js";
import { ReactFlowInstance } from "react-flow-renderer";

interface BaseComponentProps {
	color: string;
	icon: string;
	description: string;
}
function BaseComponent({ color, icon, description }: BaseComponentProps): h.JSX.Element {
	const iconEl = useRef<HTMLDivElement>(null);
	useEffect(() => {
		setIcon(iconEl.current!, icon);
	}, []);
	return (
		<div className="grid" style={{ backgroundColor: color }}>
			<div className="cmdr-macro-icon" style={{ backgroundColor: chroma(color).brighten().hex() }}>
				<div ref={iconEl} />
			</div>
			<div className="cmdr-macro-description">
				{description}
			</div>
		</div>
	);
}

export default function MacroBuilder(): h.JSX.Element {

	const [nodes, setNodes, onNodesChange] = useNodesState([
		{
			id: '1',
			type: 'input',
			data: {
				label: (
					<BaseComponent
						color={"#4caf50"}
						icon={"arrow-down-circle"}
						description={"The start of your shortcut"}
					/>
				),
			},
			position: { x: 0, y: 0 },
		},
		{
			id: '2',
			type: 'output',
			data: {
				label: (
					<BaseComponent
						color={"#f44336"}
						icon={"x-circle"}
						description={"The end of your shortcut"}
					/>
				),
			},
			position: { x: 0, y: 100 },
		},
	]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const onConnect = (params: Edge): void => setEdges((eds: Edge[]) => addEdge(params, eds));
	const [instance, setInstance] = useState<ReactFlowInstance>();

	return (
		<Fragment>
			<ReactFlowProvider>
				<ReactFlow
					defaultNodes={nodes}
					defaultEdges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onInit={setInstance}
					fitView
				>
					<Background />
				</ReactFlow>

				<div className="cmdr-macro-control">
					<div
						className="cmdr-macro-button clickable-icon"
						aria-label="Add Command"
						aria-label-position="right"
						onClick={(): void => {
							instance?.addNodes({
								id: '3',
								data: {
									label: (
										<BaseComponent
											color={"#f44336"}
											icon={"x-circle"}
											description={"The end of your shortcut"}
										/>
									),
								},
								position: { x: 0, y: 200 },
							});


						}}
					>
						<ObsidianIcon icon="command" size={24} />
					</div>
					<div className="cmdr-macro-button clickable-icon">B</div>
					<div className="cmdr-macro-button clickable-icon">C</div>
					<div className="cmdr-macro-button clickable-icon">D</div>
					<div className="cmdr-macro-button clickable-icon">E</div>
				</div>
			</ReactFlowProvider>
		</Fragment>
	);
}

function ObsidianIcon({ icon, size }: { icon: string, size?: number }): h.JSX.Element {
	const iconEl = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		setIcon(iconEl.current!, icon, size);
	}, [icon, size]);

	return <div style={{ display: "grid" }} ref={iconEl} />;
}
