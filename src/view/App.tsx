import Config from '../config';

import React from "react";
import { exportComponentAsJPEG, exportComponentAsPNG } from 'react-component-export-image';
import { Panel } from 'primereact/panel';

import ComparisonView from "./dashboards/ComparisonView";
import AppData from "../data/AppData";

export interface IAppProps
{
	db: alaSQLSpace.AlaSQL;
}

interface IAppState
{
	data: AppData;
}

export default class App extends React.Component<IAppProps, IAppState>
{

	private imageref: any;

	constructor(props: IAppProps)
	{
		super(props);
		this.state =
		{
			data: new AppData(props.db),
		};
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
					<ComparisonView data={this.state.data}/>
				</Panel>
			</React.Fragment>
		);
	}

	private exportImage(format: string) {
		const time = new Date();
		const basename = 'hin&weg-' + Config.getVersion() + "-" + time.getFullYear() + "-" + (time.getMonth() + 1) + "-" + time.getDate();
		if (format === 'png') exportComponentAsPNG(this.imageref, {fileName: basename + '.png'});
		if (format === 'jpeg') exportComponentAsJPEG(this.imageref, {fileName: basename + '.jpg'});
	}

}