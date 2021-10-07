import React from 'react';

import Config from '../../config';
import Log from '../../log';

import BaseData from '../../data/BaseData';

import Geodata from '../../model/Geodata';
import { ITimelineD3Item } from '../charts/D3Timeline';

import ViewSelector from './ViewSelector';

import GeodataView from '../geo/GeodataView';
import TableView from '../TableView';
import D3ChartView from '../charts/D3ChartView';
import D3SankeyView from '../charts/D3SankeyView';
import D3TimelineView from '../charts/D3TimelineView';
import D3ChordView from '../charts/D3ChordView';
import D3IndexView from '../charts/D3IndexView';
import ImportView from '../ImportView';
import DBView from '../DBView';
import SystemInfo from '../components/SystemInfo';
import ProjektInfo from '../components/ProjektInfo';
import StatisticsView from '../components/StatisticsView';
import SettingsView from '../components/SettingsView';

export interface TableItem {
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface StatisticPerYearAusgabe {
	Jahr: number;
	Mean: number;
	MeanZuzüge: number;
	MeanWegzüge: number;
	MedianZuzüge: number;
	MedianWegzüge: number;
	min: number;
	max: number;
}

export interface IViewSwitcherProps {
	basedata: BaseData;
	db: alaSQLSpace.AlaSQL;
	geodata: Geodata | null;
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
	vizID: number;
	baseViewId: number;
	onSelectLocation: (newLocation: string) => void;
	setGeodata: (geodata: Geodata) => void;
	setShapefileName: (shapefilename: string) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	addYear: (year: string) => void;
	onSwitchView: () => void;
	change: () => void;
	migrationsInside: boolean;
	dataProcessing: string;
	setPopulationDataLoaded: () => void;

}

interface IViewSwitcherState {
	activeView: string;
}

export default class ViewSwitcher extends React.Component<IViewSwitcherProps, IViewSwitcherState> {

	constructor(props: IViewSwitcherProps) {
		super(props);
		this.onViewSelect = this.onViewSelect.bind(this);
		this.state = {
			activeView: this.props.geodata ? 'map' : 'file',
		};
		const ipc = require('electron').ipcRenderer;
		ipc.on
		(
			'viewswitcher', (event: any, message: string) =>
			{
				this.switchView(message);
			}
		)
	}

	public render(): JSX.Element {
		let views = this.getVisibleViews();
		let showedView = this.selectCurrentView(this.state.activeView);
		let onlyFile = (((this.props.geodata == null) || (this.props.geoId == null) || (this.props.geoName == null) || (this.props.geodata.fields().indexOf(this.props.geoId) < 0) || (this.props.yearsAvailable.length === 0 )) && (this.state.activeView === 'file') );
		return (
			<div className="viewswitcher">
				<div className="p-grid">
				<div className="p-col-4 p-component noprint">
						{onlyFile ? "Datei-Import" : "Visualisierung oder Funktion wählen:"}</div>
					<div className="p-col-8 noprint">
					{onlyFile ? <div></div>
					: <ViewSelector views={views} selected={this.state.activeView} onSelectView={this.onViewSelect} />}
					</div>
					<div className="p-col-12">{showedView}</div>
				</div>
			</div>
		);
	}

	private onViewSelect(selected: string) {
		this.switchView(selected);
	}

	private switchView(newview: string) {
		Log.debug('selected view: ' + newview);
		let views = this.getVisibleViews();
		let isvisible = false;
		if (newview === 'settings') isvisible = true;
		for (let view of views) {
			if (view.value === newview) isvisible = true;
		}
		if (isvisible) {
			this.setState({ activeView: newview });
			this.props.onSwitchView();
		}
	}

	private getVisibleViews() {
		let views: any[] = [];
		this.addView(views, 'map', 'Karte', this.props.yearsAvailable.length > 0);
		this.addView(views, 'table', 'Tabelle', this.props.yearsAvailable.length > 0);
		this.addView(views, 'd3-bar', 'Balkendiagramm', (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, 'd3-sankey', 'Sankey-Diagramm', (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, 'd3-chord', 'Chord-Diagramm', (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, 'd3-timeline', 'Zeitreihen', (this.props.yearsAvailable.length > 0) && (this.props.location != null));
		this.addView(views, 'index', 'Indexwert', this.props.yearsAvailable.length > 0);
		this.addView(views, 'statistics', 'Statistiken', (this.props.yearsSelected.length > 0) && (this.props.location != null));
		this.addView(views, 'file', 'Datei', true);
		this.addView(views, 'db', 'Datenbank', this.props.yearsAvailable.length > 0);
		this.addView(views, 'systeminfo', 'Systeminformationen', true);
		this.addView(views, 'projektinfo', 'ProjektInfo', true);
		//this.addView(views, 'settings', 'Einstellungen', true);
		return views;
	}

	private addView(views: any[], value: string, label: string, selectable: boolean) {
		if (selectable && Config.getValue('components', value) == true) {
			views.push({ value: value, label: label });
			Log.trace('viewswitcher sends message:', value);
			const ipc = require('electron').ipcRenderer;
			ipc.send('menuenable', value);
		}
	}

	private selectCurrentView(view: string) {
		if (view == 'map') return this.selectMapView();
		if (view == 'table') return this.selectTableView();
		if (view == 'd3-bar') return this.selectD3BarView();
		if (view == 'd3-sankey') return this.selectD3SankeyView();
		if (view == 'd3-chord') return this.selectD3ChordView();
		if (view == 'd3-timeline') return this.selectD3TimelineView();
		if (view == 'index') return this.selectIndexView();
		if (view == 'statistics') return this.selectStatisticsView();
		if (view == 'file') return this.selectImportView();
		if (view == 'db') return this.selectDatabaseView();
		if (view == 'systeminfo') return this.selectSystemInfoView();
		if (view == 'projektinfo') return this.selectProjektInfoView();
		if (view == 'settings') return this.selectSettingsView();
		return (
			<div className="p-col-12">
				<div>Die Ansicht {view} ist unbekannt.</div>
			</div>
		);
	}

	private selectMapView() {
		return (
			<div className="p-col-12">
				<GeodataView
					basedata={this.props.basedata}
					geodata={this.props.geodata}
					items={this.props.items}
					locations={this.props.locations}
					selectedLocation={this.props.location}
					yearsSelected={this.props.yearsSelected}
					geoName={this.props.geoName}
					theme={this.props.theme}
					dataProcessing={this.props.dataProcessing}
					onSelectLocation={this.props.onSelectLocation}
				/>
			</div>
		);
	}

	private selectTableView() {
		return (
			<div className="p-col-12">
				<TableView items={this.props.items} maxRows={25} />
			</div>
		);
	}

	private selectD3BarView() {
		return (
			<div className="p-col-12">
				<D3ChartView basedata={this.props.basedata} baseViewId={this.props.baseViewId} vizID={this.props.vizID} items={this.props.items} theme={this.props.theme} yearsSelected={this.props.yearsSelected} dataProcessing={this.props.dataProcessing} />
			</div>
		);
	}

	private selectD3SankeyView() {
		return (
			<div className="p-col-12">
				<div className="sankey1">
					<D3SankeyView basedata={this.props.basedata} baseViewId={this.props.baseViewId} vizID={this.props.vizID} items={this.props.items} theme={this.props.theme} yearsSelected={this.props.yearsSelected} dataProcessing={this.props.dataProcessing} />
				</div>
			</div>
		);
	}

	private selectD3ChordView() {
		if (this.props.yearsAvailable.length > 0) {
			return (
				<div className="p-col-12">
					<D3ChordView basedata={this.props.basedata} dataProcessing={this.props.dataProcessing} baseViewId={this.props.baseViewId} vizID={this.props.vizID} items={this.props.items} theme={this.props.theme} yearsSelected={this.props.yearsSelected} />
				</div>
			);
		}
	}

	private selectD3TimelineView() {
		if (this.props.yearsAvailable.length > 0) {
			return (
				<div className="p-col-12">
					<D3TimelineView baseViewId={this.props.baseViewId} vizID={this.props.vizID} items={this.props.timeline} yearsSelected={this.props.yearsSelected}  />
				</div>
			);
		}
	}

	private selectIndexView() {
		return (
			<div className="p-col-12">
				<D3IndexView migrationsInside={this.props.migrationsInside} baseViewId={this.props.baseViewId} vizID={this.props.vizID} db={this.props.db} theme={this.props.theme} location={this.props.location} locations={this.props.locations} yearsAvailable={this.props.yearsAvailable} yearsSelected={this.props.yearsSelected} dataProcessing={this.props.dataProcessing}/>
			</div>
		);
	}

	private selectStatisticsView() {
		return (
			<div className="p-col-12">
				<StatisticsView baseViewId={this.props.baseViewId} vizID={this.props.vizID} items={this.omitNaN(this.props.items)} theme={this.props.theme} location={this.props.location} yearsSelected={this.props.yearsSelected} statisticPerYearAusgabe={this.props.statisticPerYearAusgabe} />
			</div>
		);
	}

	private omitNaN(items: TableItem[]): TableItem[] {
		let results: TableItem[] = [];
		for (let item of items)
		{
			if (!isNaN(item.Wert)) results.push(item);
		}
		return results;
	}

	private selectImportView() {
		return (
			<div className="p-col-12">
				<ImportView
					db={this.props.db}
					geodata={this.props.geodata}
					geoName={this.props.geoName}
					geoId={this.props.geoId}
					shapefilename={this.props.shapefilename}
					setGeodata={this.props.setGeodata}
					setGeoName={this.props.setGeoName}
					setGeoId={this.props.setGeoId}
					setShapefileName={this.props.setShapefileName}
					addYear={this.props.addYear}
					change={this.props.change}
					setPopulationDataLoaded={this.props.setPopulationDataLoaded}
				/>
			</div>
		);
	}

	private selectDatabaseView() {
		return (
			<div className="p-col-12">
				<DBView db={this.props.db} />
			</div>
		);
	}

	private selectSystemInfoView() {
		return (
			<div className="p-col-12">
				<SystemInfo />
			</div>
		);
	}

	private selectProjektInfoView() {
		return (
			<div className="p-col-12">
				<ProjektInfo />
			</div>
		);
	}

	private selectSettingsView() {
		return (
			<div className="p-col-12">
				<SettingsView change={this.props.change} />
			</div>
		);
	}
}
