import BaseData from "../../data/BaseData";

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
	basedata: BaseData;
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
	dataProcessing: string;
	setPopulationDataLoaded: () => void;
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
		Log.trace("dashboard data: ", this.props.items);
		return this.selectCurrentView(this.props.view);
	}

	private getViewSwitcher(index: number): JSX.Element
	{
		const first = (index === 1) ? true : false;
		return (
			<ViewSwitcher first={first} viewid={"id"+this.props.baseViewId + "-" + index} basedata={this.props.basedata} dataProcessing={this.props.dataProcessing} baseViewId={this.props.baseViewId} vizID={this.state.count} onSwitchView={this.updateCounter} geodata={this.props.geodata} db={this.props.db} items={this.props.items} statisticPerYearAusgabe={this.props.statisticPerYearAusgabe} timeline={this.props.timeline} geoName={this.props.geoName} geoId={this.props.geoId} shapefilename={this.props.shapefilename} locations={this.props.locations} location={this.props.location} theme={this.props.theme} yearsAvailable={this.props.yearsAvailable} yearsSelected={this.props.yearsSelected} onSelectLocation={this.props.onSelectLocation} setGeodata={this.props.setGeodata} setGeoName={this.props.setGeoName} setGeoId={this.props.setGeoId} setShapefileName={this.props.setShapefileName} addYear={this.props.addYear} change={this.props.change}
			migrationsInside={this.props.migrationsInside} setPopulationDataLoaded={this.props.setPopulationDataLoaded}
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
		return this.getViewSwitcher(1);
	}

	private select_t1b1(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-12 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-12 pb">
					{this.getViewSwitcher(2)}
				</div>
			</div>
		);
	}

	private select_l1r1(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(2)}
				</div>
			</div>
		);
	}

	private select_t1b2(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-12 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(2)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(3)}
				</div>
			</div>
		);
	}

	private select_t2b1(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(2)}
				</div>
				<div className="p-col-12 pb">
					{this.getViewSwitcher(3)}
				</div>
			</div>
		);
	}

	private select_l1r2(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-6">
					<div className="p-col-12 pb">
						{this.getViewSwitcher(2)}
					</div>
					<div className="p-col-12 pb">
						{this.getViewSwitcher(3)}
					</div>
				</div>
			</div>
		);
	}

	private select_v3(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-4 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-4 pb">
					{this.getViewSwitcher(2)}
				</div>
				<div className="p-col-4 pb">
					{this.getViewSwitcher(3)}
				</div>
			</div>
		);
	}

	private select_l2r2(): JSX.Element
	{
		return (
			<div className="p-grid">
				<div className="p-col-6 pb">
					{this.getViewSwitcher(1)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(2)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(3)}
				</div>
				<div className="p-col-6 pb">
					{this.getViewSwitcher(4)}
				</div>
			</div>
		);
	}

}
