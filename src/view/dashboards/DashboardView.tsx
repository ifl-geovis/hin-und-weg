import React from "react";

import Config from "../../config";
import Log from "../../log";

import Geodata from "../../model/Geodata";
import {ITimelineD3Item} from "../charts/D3Timeline";

import ViewSwitcher from "./ViewSwitcher";

export interface TableItem
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface StatisticPerYearAusgabe
{
	Jahr: number;
	Mean: number;
	MeanZuzüge: number;
	MeanWegzüge: number;
	MedianZuzüge: number;
	MedianWegzüge: number;
	min: number;
	max: number;
}

export interface IDashboardProps
{
	view:string;
	geodata: Geodata | null;
	db: alaSQLSpace.AlaSQL;
	items: TableItem[];
	timeline: ITimelineD3Item[];
	statisticPerYearAusgabe: StatisticPerYearAusgabe[];
	geoName: string | null;
	geoId: string | null;
	shapefilename: string;
	locations: string[];
	location: string | null;
	theme: string;
	yearsAvailable: string[];
	yearsSelected: string[];
	baseViewId: number;
	onSelectLocation: (newLocation: string) => void;
	setGeodata: (geodata: Geodata) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	setShapefileName: (shapefilename: string) => void;
	addYear: (year: string) => void;
	change: () => void;
	migrationsInside: boolean;
}

export interface IDashboardState
{
	count: number;
}

export default class DashboardView extends React.Component<IDashboardProps, IDashboardState>
{

	constructor(props: IDashboardProps)
	{
		super(props);
		this.updateCounter = this.updateCounter.bind(this);

		this.state =
		{
			count: 0
		};
	}

	public render(): JSX.Element
	{
		return this.selectCurrentView(this.props.view);
	}

	private getViewSwitcher(): JSX.Element
	{
		return (
			<ViewSwitcher baseViewId={this.props.baseViewId} vizID={this.state.count} onSwitchView={this.updateCounter} geodata={this.props.geodata} db={this.props.db} items={this.props.items} statisticPerYearAusgabe={this.props.statisticPerYearAusgabe} timeline={this.props.timeline} geoName={this.props.geoName} geoId={this.props.geoId} shapefilename={this.props.shapefilename} locations={this.props.locations} location={this.props.location} theme={this.props.theme} yearsAvailable={this.props.yearsAvailable} yearsSelected={this.props.yearsSelected} onSelectLocation={this.props.onSelectLocation} setGeodata={this.props.setGeodata} setGeoName={this.props.setGeoName} setGeoId={this.props.setGeoId} setShapefileName={this.props.setShapefileName} addYear={this.props.addYear} change={this.props.change} 
			migrationsInside={this.props.migrationsInside}
			/>
		);
	}

	private updateCounter()
	{
		this.setState({count: this.state.count + 1 });
	}

	private selectCurrentView(view: string): JSX.Element
	{
		if (view == "t1b1") return this.select_t1b1();
		if (view == "l1r1") return this.select_l1r1();
		if (view == "t1b2") return this.select_t1b2();
		if (view == "t2b1") return this.select_t2b1();
		if (view == "l1r2") return this.select_l1r2();
		if (view == "v3") return this.select_v3();
		if (view == "l2r2") return this.select_l2r2();
		return this.getViewSwitcher();
	}

	private select_t1b1(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-12 pb">
					{viewswitcher}
				</div>
				<div className="p-col-12 pb">
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
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
			</div>
		);
	}

	private select_t1b2(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-12 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
			</div>
		);
	}

	private select_t2b1(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-12 pb">
					{viewswitcher}
				</div>
			</div>
		);
	}

	private select_l1r2(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6">
					<div className="p-col-12 pb">
						{viewswitcher}
					</div>
					<div className="p-col-12 pb">
						{viewswitcher}
					</div>
				</div>
			</div>
		);
	}

	private select_v3(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-4 pb">
					{viewswitcher}
				</div>
				<div className="p-col-4 pb">
					{viewswitcher}
				</div>
				<div className="p-col-4 pb">
					{viewswitcher}
				</div>
			</div>
		);
	}

	private select_l2r2(): JSX.Element
	{
		let viewswitcher = this.getViewSwitcher();
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
				<div className="p-col-6 pb">
					{viewswitcher}
				</div>
			</div>
		);
	}

}
