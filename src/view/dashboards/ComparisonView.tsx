import React from "react";
import R from "ramda";
import Geodata from "../../model/Geodata";

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
	geodata: Geodata | null;
	geoId: string | null;
	geoName: string | null;
	yearsAvailable: string[];
	shapefilename: string;
	populationDataLoaded: boolean;
}

export default class ComparisonView extends React.Component<IComparisonProps, IComparisonState>
{

	constructor(props: IComparisonProps)
	{
		super(props);
		this.state =
		{
			dashboard_configuration: "s1",
			geodata: null,
			geoId: "OT",
			geoName: null,
			yearsAvailable: [],
			shapefilename: "",
			populationDataLoaded: false,
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
		return this.getBaseView(view, "wide", 0);
	}

	private getBaseView(view: string, space: string, id: number): JSX.Element
	{
		return (
			<BaseView baseViewId={id} view={view} space={space} db={this.props.db} geodata={this.state.geodata} geoName={this.state.geoName} geoId={this.state.geoId} yearsAvailable={this.state.yearsAvailable} shapefilename={this.state.shapefilename}
				setGeodata={(newGeodata) => { this.setState({ geodata: newGeodata }); }}
				setShapefileName={(newName) => { this.setState({ shapefilename: newName }); }}
				setGeoName={(newGeoName) => { this.setState({ geoName: newGeoName }); }}
				setGeoId={(newGeoId) => { this.setState({ geoId: newGeoId }); }}
				addYear={(year) => { this.setState({ yearsAvailable: R.uniq(R.append(year, this.state.yearsAvailable)) }); }}
				populationDataLoaded={this.state.populationDataLoaded}
				setPopulationDataLoaded={() => this.setState({ populationDataLoaded: true })}
			/>
		);
	}

	private select_cls1rs1(): JSX.Element
	{
		let comparison1 = this.getBaseView("s1", "narrow",1);
		let comparison2 = this.getBaseView("s1", "narrow",2);
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
