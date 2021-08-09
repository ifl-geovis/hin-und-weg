import React from "react";
import { Panel } from 'primereact/panel';

import ComparisonView from "./dashboards/ComparisonView";

export interface IAppProps
{
	db: alaSQLSpace.AlaSQL;
}

export default class App extends React.Component<IAppProps>
{

	constructor(props: IAppProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		return (
			<Panel className="app">
				<ComparisonView db={this.props.db}/>
			</Panel>
		);
	}

}