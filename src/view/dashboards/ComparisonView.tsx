import React from "react";

import BaseView from "./BaseView";

import Config from "../../config";
import Log from "../../log";

export interface TableItem
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface IComparisonProps
{
	db: alaSQLSpace.AlaSQL;
}

interface IComparisonState
{
	dashboard_configuration: string;
}

export default class ComparisonView extends React.Component<IComparisonProps, IComparisonState>
{

	constructor(props: IComparisonProps)
	{
		super(props);
		this.state =
		{
			dashboard_configuration: "s1",
		};
		const ipc = require('electron').ipcRenderer;
		ipc.on
		(
			'dashboard', (event: any, message: string) =>
			{
				this.setState({dashboard_configuration: message});
			}
		)
	}

	public render(): JSX.Element
	{
		return this.selectCurrentView(this.state.dashboard_configuration);
	}

	private selectCurrentView(view: string): JSX.Element
	{
		if (view == "cls1rs1") return this.select_cls1rs1();
		return this.getBaseView(view, "wide");
	}

	private getBaseView(view: string, space: string): JSX.Element
	{
		return (
			<BaseView view={view} space={space} db={this.props.db}/>
		);
	}

	private select_cls1rs1(): JSX.Element
	{
		let comparison1 = this.getBaseView("s1", "narrow");
		let comparison2 = this.getBaseView("s1", "narrow");
		return (
			<div className="p-grid">
				<div className="p-col-6">
					{comparison1}
				</div>
				<div className="p-col-6">
					{comparison2}
				</div>
			</div>
		);
	}

}
