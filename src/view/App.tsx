import { TabPanel, TabView } from "primereact/tabview";

import R from "ramda";
import React from "react";

import Geodata from "../model/Geodata";
import { GeoJsonProperties } from "geojson";

import ChartsView from "./charts/ChartsView";
import D3ChartView from "./charts/D3ChartView";
import { TimelineView } from "./charts/TimelineView";
import ImportView from "./ImportView";
import DBView from "./DBView";
import GeodataView from "./geo/GeodataView";
import TableView from "./TableView";
import Location from "./Location";
import Themes from "./Themes";
import Years from "./Years";
import SystemInfo from "../components/SystemInfo";
import StatisticsView from "../components/StatisticsView";
import ViewSwitcher from "./dashboards/ViewSwitcher";

import Config from "../config";
import Log from "../log";

export interface IAppProps
{
	db: alaSQLSpace.AlaSQL;
}

interface IAppState
{
	geodata: Geodata | null;
	geoId: string | null;
	geoName: string | null;
	yearsAvailable: string[];
	years: string[];
	location: string | null;
	showLabels: boolean;
	theme: string;
	activeTab: number;
}

export default class App extends React.Component<IAppProps, IAppState>
{

	constructor(props: IAppProps)
	{
		super(props);
		this.state =
		{
			geodata: null,
			geoId: "OT",
			geoName: null,
			location: null,
			showLabels: true,
			theme: "Von",
			years: [],
			yearsAvailable: [],
			activeTab: 6,
		};
	}

	public render(): JSX.Element
	{
		const results = this.query();
		const timeline = this.queryTimeline();
		const status = this.getStatus();
		let attributes: GeoJsonProperties[] = [];
		let fieldNameLoc = this.state.geoName as string;
		let locations: string[] = [];
		const systeminfo = (Config.getValue("components", "systeminfo") == true);
		if (this.state.geodata != null && this.state.geoName != null)
		{
			attributes = this.state.geodata.attributes();
			locations = R.sort((a: string, b: string) => a.localeCompare(b), R.map((item) => item![fieldNameLoc], attributes));
		}
		return (
			<div className="p-grid">
				<div className="p-col-12">
					<p className="status">{status}</p>
				</div>
				<div className="p-col-2">
					<div className="p-col-12">
						<img src="./assets/blue_huwlogo.png" />
					</div>
					<div className="p-grid p-justify-around">
						<div className="p-col-12">
							<Location title="Bezugsfläche" locations={locations} selectedLocation={this.state.location} onSelectLocation={(newLocation) => this.setState({location: newLocation})}/>
						</div>
						<div className="p-col-12" style={(this.state.activeTab == 2) ? {display: "none"} : {display: "block"}}>
							<Themes themes={["Von", "Nach", "Saldi"]} selected={ this.state.theme} setTheme={(newTheme) => this.setState({ theme: newTheme})}/>
						</div>
						<div className="p-col-12" style={((this.state.yearsAvailable.length == 0) || (this.state.activeTab == 2)) ? {display: "none"} : {display: "block"}}>
							<Years availableYears={this.state.yearsAvailable} selected={this.state.years} setYears={(newYears) => this.setState({years: newYears})}/>
						</div>
					</div>
				</div>
				<div className="p-col-10">
					<ViewSwitcher/>
				</div>
				<div className="p-col-10">
					<TabView className="p-tabview-right" activeIndex={this.state.activeTab} onTabChange={(e) => this.setState({activeTab: e.index})}>
						<TabPanel header="Karte" disabled={this.state.geodata == null}>
							<GeodataView geodata={this.state.geodata} items={results} locations={locations} selectedLocation={this.state.location} showLabels={this.state.showLabels} geoName={this.state.geoName}
								onSelectLocation={(newLocation) => this.setState({location: newLocation})}
								setShowLabels={(show) => this.setState({showLabels: show})} theme={this.state.theme}
							/>
						</TabPanel>
						<TabPanel header="Tabelle" disabled={this.state.yearsAvailable.length == 0}>
							<TableView items={results} maxRows={25}/>
						</TabPanel>
						<TabPanel header="Zeitreihen" disabled={(this.state.yearsAvailable.length == 0) || (this.state.location == null)}>
							<TimelineView data={timeline} />
						</TabPanel>
						<TabPanel header="Diagramm" disabled={(this.state.yearsAvailable.length == 0) || (this.state.location == null)}>
							<ChartsView items={results} theme={this.state.theme} />
						</TabPanel>
						<TabPanel header="D3 Bar Chart"  disabled={(this.state.yearsAvailable.length == 0) || (this.state.location == null)}>
							<D3ChartView items={results} theme={this.state.theme} />
						</TabPanel>
						<TabPanel header="Statistiken"  disabled={(this.state.yearsAvailable.length == 0) || (this.state.location == null)}>
							<StatisticsView items={results} />
						</TabPanel>
						<TabPanel header="Datei">
							<ImportView db={this.props.db} geodata={this.state.geodata} geoName={this.state.geoName} geoId={this.state.geoId}
								addYear={(year) =>
									{
										this.setState({ yearsAvailable: R.uniq(R.append(year, this.state.yearsAvailable)) });
									}}
								setGeodata={(newGeodata) => { this.setState({ geodata: newGeodata }); }}
								setGeoName={(newGeoName) => { this.setState({ geoName: newGeoName }); }}
								setGeoId={(newGeoId) => { this.setState({ geoId: newGeoId }); }} />
						</TabPanel>
						<TabPanel header="Datenbank" disabled={this.state.yearsAvailable.length == 0}>
							<DBView db={this.props.db} />
						</TabPanel>
						<TabPanel header="Systeminformationen" headerStyle={(systeminfo) ? {display: "block"} : {display: "none"}}>
							<SystemInfo />
						</TabPanel>
					</TabView>
				</div>
			</div>
		);
	}

	private getStatus(): string
	{
		let status = "";
		if (this.state.location)
		{
			status = `Ort/Gebiet ${this.state.location}, `;
		}
		else
		{
			status = "Kein Ort/Gebiet, ";
		}
		if (this.state.theme)
		{
			status += ` Thema '${this.state.theme}', `;
		}
		if (R.not(R.isEmpty(this.state.years)))
		{
			status += `und Jahre: ${R.join(", ", R.sort((a, b) => a.localeCompare(b), this.state.years))}`;
		}
		else
		{
			status += "und keine Jahre";
		}
		return `${status} ausgewählt.`;
	}

	private query(): any[]
	{
		let results: any[] = [];
		if ( R.or(R.isNil(this.state.location), R.isEmpty(this.state.yearsAvailable)) )
		{
			return results;
		}
		// disabled because of #2883
		//const years = R.isEmpty(this.state.years) ? this.state.yearsAvailable : this.state.years;
		const years = this.state.years;
		const stringYears =  R.join(", ", R.map((year) => `'${year}'`, years));
		const location = ` ('${this.state.location}') `;
		let query = "";
		if ( this.state.theme === "Von")
		{
			query = `SELECT '${this.state.location}' as Von, Nach, SUM(Wert) as Wert FROM matrices ` + `WHERE Von IN ${location} AND Jahr IN (${stringYears}) ` + `GROUP BY Nach `;
		}
		else if ( this.state.theme === "Nach")
		{
			query = `SELECT Von, '${this.state.location}' as Nach, SUM(Wert) as Wert FROM matrices ` + `WHERE Nach IN ${location} AND Jahr IN (${stringYears}) ` + `GROUP BY Von `;
		}
		else if ( this.state.theme === "Saldi")
		{
			const vonQuery = `SELECT '${this.state.location}' as Von, Nach, SUM(Wert) as Wert FROM matrices ` + `WHERE  Von IN ${location}  AND Jahr IN (${stringYears}) ` + `GROUP BY Nach ORDER BY Nach`;
			const nachQuery = `SELECT Von, '${this.state.location}' as Nach, SUM(Wert) as Wert FROM matrices ` + `WHERE Nach IN ${location} AND Jahr IN (${stringYears}) ` + `GROUP BY Von ORDER BY Von`;
			const vonResults = this.props.db(vonQuery);
			const nachResults = this.props.db(nachQuery);
			for (let i = 0 ; i < nachResults.length; i++)
			{
				const saldiItem = { Von: nachResults[i].Von, Nach:  nachResults[i].Nach, Wert: (nachResults[i].Wert - vonResults[i].Wert) };
				results = R.append(saldiItem, results);
			}
			return results;
		}
		Log.debug("Query: ", query);
		results = this.props.db(query);
		return results;
	}

	private queryTimeline(): any[]
	{
		let results: any[] = [];
		if ( R.or(R.isNil(this.state.location), R.isEmpty(this.state.yearsAvailable)) )
		{
			return results;
		}
		let query_zuzug = `SELECT Nach, Jahr, sum(Wert) as zuzug FROM matrices where Nach = '${this.state.location}' AND Von <> Nach GROUP BY Nach, Jahr`;
		let results_zuzug = this.props.db(query_zuzug);
		let query_wegzug = `SELECT Von, Jahr, sum(Wert) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		let results_wegzug = this.props.db(query_wegzug);
		for (let year of this.state.yearsAvailable.sort())
		{
			let zuzug = this.getFieldForYear(results_zuzug, year, "zuzug");
			let wegzug = this.getFieldForYear(results_wegzug, year, "wegzug");
			results.push(
				{
					"Ort": this.state.location,
					"Jahr": year,
					"Zuzug": zuzug,
					"Wegzug": - wegzug,
					"Saldo": zuzug - wegzug,
				}
			);
		}
		return results;
	}

	private getFieldForYear(data: any[], year: string, field: string)
	{
		for (let item of data)
		{
			if (item["Jahr"] === year)
			{
				return item[field];
			}
		}
		return 0;
	}

}