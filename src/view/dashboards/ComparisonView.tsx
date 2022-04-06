import React from "react";
import R from "ramda";

import BaseView from "./BaseView";
import Geodata from "../../model/Geodata";

import Project from '../../project';

import Config from "../../config";
import Log from "../../log";
import AppData from "../../data/AppData";

export interface TableItem
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface IComparisonProps
{
	data: AppData;
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
	change: boolean;
}

export default class ComparisonView extends React.Component<IComparisonProps, IComparisonState> {

	constructor(props: IComparisonProps) {
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
			change: true,
		};
		this.change = this.change.bind(this);
		this.openProject = this.openProject.bind(this);
		this.saveProject = this.saveProject.bind(this);
		this.props.data.setChange(this.change);
		const ipc = require('electron').ipcRenderer;
		ipc.on('dashboard', (event: any, message: string) => {
				this.setState({dashboard_configuration: message});
			}
		);
		ipc.on('project-open', (event: any, message: string) => {
				this.openProject(message);
			}
		);
		ipc.on('project-save', (event: any, message: string) => {
				this.saveProject(message);
			}
		);
	}

	public render(): JSX.Element {
		Log.debug("this.state: ", this.state);
		return this.selectCurrentView(this.state.dashboard_configuration);
	}

	private selectCurrentView(view: string): JSX.Element {
		if (view == "cls1rs1") return this.select_cls1rs1();
		return this.getBaseView(view, "wide", 0);
	}

	private getBaseView(view: string, space: string, id: number): JSX.Element {
		return (
			<BaseView baseViewId={id} view={view} space={space} appdata={this.props.data} db={this.props.data.getDB()} geodata={this.state.geodata} geoName={this.state.geoName} geoId={this.state.geoId} yearsAvailable={this.state.yearsAvailable} shapefilename={this.state.shapefilename}
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

	private select_cls1rs1(): JSX.Element {
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

	private change() {
		this.setState({ change: this.state.change ? false : true });
	}

	private openProject(path: string) {
		Log.debug("open project from: ", path);
		Project.load(path);
		this.props.data.restoreAppData(Project.getData("appdata"));
		Log.debug("restored db data: ", this.props.data.gatherAppData());
		this.restoreComparisonData(Project.getData("comparison"));
	}

	private restoreComparisonData(data: any)
	{
		Log.debug("restore comparison with: ", data);
		let geodata = null;
		if (data.geodata) {
			geodata = new Geodata(data.geodata.featureCollection, data.geodata.projection);
		}
		this.setState({
			change: this.state.change ? false : true,
			dashboard_configuration: data.dashboard_configuration,
			geodata: geodata,
			geoId: data.geoId,
			yearsAvailable: data.yearsAvailable,
			shapefilename: data.shapefilename,
			populationDataLoaded: data.populationDataLoaded
		});
	}

	private saveProject(path: string) {
		Log.debug("save project on: ", path);
		Project.addData("comparison", this.gatherComparisonData());
		Project.addData("appdata", this.props.data.gatherAppData());
		Project.save(path);
	}

	private gatherComparisonData()
	{
		let result: any = {};
		result.dashboard_configuration = this.state.dashboard_configuration;
		result.geodata = this.state.geodata ? this.state.geodata.gatherGeodata() : null;
		result.geoId = this.state.geoId;
		result.yearsAvailable = this.state.yearsAvailable;
		result.shapefilename = this.state.shapefilename;
		result.populationDataLoaded = this.state.populationDataLoaded;
		return result;
	}

}