import { TabPanel, TabView } from "primereact/tabview";

import R from "ramda";
import React from "react";

import Geodata from "../model/Geodata";

import ChartsView from "./charts/ChartsView";
import ConfigurationView from "./ConfigurationView";
import DBView from "./DBView";
import GeodataView from "./geo/GeodataView";
import TableView from "./TableView";
import Location from "./Location";
import Themes from "./Themes";
import Years from "./Years";

export interface IAppProps
{
	db: alaSQLSpace.AlaSQL;
}

interface IAppState
{
	geodata: Geodata | null;
	yearsAvailable: string[];
	years: string[];
	location: string | null;
	showLabels: boolean;
	theme: string;
}

export default class App extends React.Component<IAppProps, IAppState>
{

	constructor(props: IAppProps)
	{
		super(props);
		this.state =
		{
			geodata: null,
			location: null,
			showLabels: true,
			theme: "Von",
			years: [],
			yearsAvailable: [],
		};
	}

	public render(): JSX.Element
	{
		const results = this.query();
		const status = this.getStatus();
		return (
			<div className="p-grid">
				<div className="p-col-2">
					<div className="p-col-12">
						<img src="./assets/blue_huwlogo.png" />
					</div>
					<div className="p-grid p-justify-around">
						<div className="p-col-12">
							<Location title="test 123"/>
						</div>
						<div className="p-col-12">
							<Themes themes={["Von", "Nach", "Saldi"]} selected={ this.state.theme} setTheme={(newTheme) => this.setState({ theme: newTheme})}/>
						</div>
						<div className="p-col-12">
							<Years availableYears={this.state.yearsAvailable} selected={this.state.years} setYears={(newYears) => this.setState({years: newYears})}/>
						</div>
					</div>
				</div>
				<div className="p-col-10">
					<TabView className="p-tabview-right" activeIndex={3}>
						<TabPanel header="Karte" disabled={this.state.geodata == null}>
							<GeodataView geodata={this.state.geodata} items={results} selectedLocation={this.state.location} showLabels={this.state.showLabels}
								onSelectLocation={(newLocation) => this.setState({location: newLocation})}
								setShowLabels={(show) => this.setState({showLabels: show})}
							/>
						</TabPanel>
						<TabPanel header="Tabelle" disabled={this.state.yearsAvailable.length == 0}>
							<TableView items={results} maxRows={25}/>
						</TabPanel>
						<TabPanel header="Diagramm" disabled={(this.state.yearsAvailable.length == 0) || (this.state.location == null)}>
							<ChartsView items={results} />
						</TabPanel>
						<TabPanel header="Datei">
							<ConfigurationView db={this.props.db} geodata={this.state.geodata}
								addYear= {(year) =>
									{
										this.setState({ yearsAvailable: R.uniq(R.append(year, this.state.yearsAvailable)) });
									}}
								setGeodata={(newGeodata) => { this.setState({ geodata: newGeodata }); }} />
						</TabPanel>
						<TabPanel header="Datenbank" disabled={this.state.yearsAvailable.length == 0}>
							<DBView db={this.props.db} />
						</TabPanel>
					</TabView>
				</div>
				<div className="p-col-12">
					<p className="status">{status}</p>
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
			status += `und Jahre: ${R.join(", ", R.sort((a, b) => a.localeCompare(b), this.state.yearsAvailable))}`;
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
		const years = R.isEmpty(this.state.years) ? this.state.yearsAvailable : this.state.years;
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
		// console.log("Query: ", query);
		results = this.props.db(query);
		return results;
	}

}