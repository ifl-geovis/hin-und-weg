import React from "react";

import Config from "../../config";
import Log from "../../log";

import Geodata from "../../model/Geodata";

import ViewSelector from "./ViewSelector";

import TableView from "../TableView";
import { TimelineView, ITimelineItem } from "../charts/TimelineView";
import ChartsView from "../charts/ChartsView";
import D3ChartView from "../charts/D3ChartView";
import StatisticsView from "../../components/StatisticsView";
import DBView from "../DBView";
import SystemInfo from "../../components/SystemInfo";


export interface TableItem
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface IViewSwitcherProps
{
	geodata: Geodata | null;
	db: alaSQLSpace.AlaSQL;
	items: TableItem[];
	timeline: ITimelineItem[];
	locations: string[];
	location: string | null;
	theme: string;
	yearsAvailable: string[];
}

interface IViewSwitcherState
{
	activeView: string;
}

export default class ViewSwitcher extends React.Component<IViewSwitcherProps, IViewSwitcherState>
{

	constructor(props: IViewSwitcherProps)
	{
		super(props);
		this.onViewSelect = this.onViewSelect.bind(this);
		this.state =
		{
			activeView: "file",
		};
	}

	public render(): JSX.Element
	{
		let views = this.getVisibleViews();
		let showedView = this.selectCurrentView(this.state.activeView);
		return (
			<div className="viewswitcher">
				<div className="p-grid">
					<div className="p-col-4">Ansicht wählen:</div>
					<div className="p-col-8">
						<ViewSelector views={views} selected={this.state.activeView} onSelectView={this.onViewSelect}/>
					</div>
					<div className="p-col-12">
						{showedView}
					</div>
				</div>
			</div>
		);
	}

	private onViewSelect(selected: string)
	{
		Log.debug("selected view: " + selected);
		this.setState({activeView: selected});
	}

	private getVisibleViews()
	{
		let views: any[] = [];
		this.addView(views, "map", "Karte", (this.props.yearsAvailable.length > 0));
		this.addView(views, "table", "Tabelle", (this.props.yearsAvailable.length > 0));
		this.addView(views, "timeline", "Zeitreihen", (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, "charts", "Diagramm", (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, "d3-bar", "D3 Bar Chart", (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, "statistics", "Statistiken", (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, "file", "Datei", true);
		this.addView(views, "db", "Datenbank", (this.props.yearsAvailable.length > 0));
		this.addView(views, "systeminfo", "Systeminformationen", true);
		return views;
	}

	private addView(views: any[], value: string, label: string, selectable: boolean)
	{
		if ((selectable) && (Config.getValue("components", value) == true))
		{
			views.push({value: value, label: label});
		}
	}

	private selectCurrentView(view: string)
	{
		if (view == "table") return this.selectTableView();
		if (view == "timeline") return this.selectTimelineView();
		if (view == "charts") return this.selectChartsView();
		if (view == "d3-bar") return this.selectD3BarView();
		if (view == "statistics") return this.selectStatisticsView();
		if (view == "db") return this.selectDatabaseView();
		if (view == "systeminfo") return this.selectSystemInfoView();
		return (
			<div className="p-col-12">
				<div>Die Ansicht {view} ist unbekannt.</div>
			</div>
		);
	}

	private selectTableView()
	{
		return (
			<div className="p-col-12">
				<TableView items={this.props.items} maxRows={25}/>
			</div>
		);
	}

	private selectTimelineView()
	{
		return (
			<div className="p-col-12">
				<TimelineView data={this.props.timeline} />
			</div>
		);
	}

	private selectChartsView()
	{
		return (
			<div className="p-col-12">
				<ChartsView items={this.props.items} theme={this.props.theme} />
			</div>
		);
	}

	private selectD3BarView()
	{
		return (
			<div className="p-col-12">
				<D3ChartView items={this.props.items} theme={this.props.theme} />
			</div>
		);
	}

	private selectStatisticsView()
	{
		return (
			<div className="p-col-12">
				<StatisticsView items={this.props.items} />
			</div>
		);
	}

	private selectDatabaseView()
	{
		return (
			<div className="p-col-12">
				<DBView db={this.props.db} />
			</div>
		);
	}

	private selectSystemInfoView()
	{
		return (
			<div className="p-col-12">
				<SystemInfo />
			</div>
		);
	}

}
