import React from "react";

import Config from "../../config";
import Log from "../../log";

import Geodata from "../../model/Geodata";
import {ITimelineItem} from "../charts/TimelineView";

import ViewSwitcher from "./ViewSwitcher";


export interface TableItem
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface IDashboardProps
{
	geodata: Geodata | null;
	db: alaSQLSpace.AlaSQL;
	items: TableItem[];
	timeline: ITimelineItem[];
	geoName: string | null;
	geoId: string | null;
	locations: string[];
	location: string | null;
	theme: string;
	yearsAvailable: string[];
	onSelectLocation: (newLocation: string) => void;
	setGeodata: (geodata: Geodata) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	addYear: (year: string) => void;
}

interface IDashboardState
{
	dashboard_configuration: string;
}

export default class DashboardView extends React.Component<IDashboardProps, IDashboardState>
{

	constructor(props: IDashboardProps)
	{
		super(props);
		this.state =
		{
			dashboard_configuration: "s1",
		};
	}

	public render(): JSX.Element
	{
		return this.selectCurrentView(this.state.dashboard_configuration);
	}

	private getViewSwitcher(): JSX.Element
	{
		return (
			<ViewSwitcher geodata={this.props.geodata} db={this.props.db} items={this.props.items} timeline={this.props.timeline} geoName={this.props.geoName} geoId={this.props.geoId} locations={this.props.locations} location={this.props.location} theme={this.props.theme} yearsAvailable={this.props.yearsAvailable} onSelectLocation={this.props.onSelectLocation} setGeodata={this.props.setGeodata} setGeoName={this.props.setGeoName} setGeoId={this.props.setGeoId} addYear={this.props.addYear} />
		);
	}

	private selectCurrentView(view: string): JSX.Element
	{
		if (view == "t1b1") return this.select_t1b1();
		if (view == "l1r1") return this.select_l1r1();
		return this.getViewSwitcher();
	}

	private select_t1b1(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-12">
					{viewswitcher}
				</div>
				<div className="p-col-12">
					{viewswitcher}
				</div>
			</div>
		);
	}

	private select_l1r1(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-6">
					{viewswitcher}
				</div>
				<div className="p-col-6">
					{viewswitcher}
				</div>
			</div>
		);
	}

}
