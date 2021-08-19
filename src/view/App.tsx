import React from "react";
import { exportComponentAsJPEG, exportComponentAsPDF, exportComponentAsPNG } from 'react-component-export-image';
import { Panel } from 'primereact/panel';

import ComparisonView from "./dashboards/ComparisonView";

export interface IAppProps
{
	db: alaSQLSpace.AlaSQL;
}

export default class App extends React.Component<IAppProps>
{

	private imageref: any;

	constructor(props: IAppProps)
	{
		super(props);
		this.imageref = React.createRef();
		const ipc = require('electron').ipcRenderer;
		ipc.on
		(
			'export-image', (event: any, message: string) =>
			{
				this.exportImage(message);
			}
		)
	}

	public render(): JSX.Element
	{
		return (
			<React.Fragment>
				<Panel className="app" ref={this.imageref}>
					<ComparisonView db={this.props.db}/>
				</Panel>
			</React.Fragment>
		);
	}

	private exportImage(format: string) {
		if (format === 'png') exportComponentAsPNG(this.imageref);
		if (format === 'jpeg') exportComponentAsJPEG(this.imageref);
	}

}