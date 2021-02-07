import R from 'ramda';
import React from 'react';

import Geodata from '../../model/Geodata';
import { GeoJsonProperties } from 'geojson';

import Classification from '../../data/Classification';

import Location from '../Location';
import Themes from '../Themes';
import Years from '../Years';
import ClassificationSelections from '../selections/ClassificationSelections';
import ArrowColorSelections from '../selections/ArrowColorSelections';
import DashboardView from './DashboardView';

import Config from '../../config';
import Log from '../../log';

export interface IBaseProps {
	db: alaSQLSpace.AlaSQL;
	view: string;
	space: string;
	geodata: Geodata | null;
	geoName: string | null;
	geoId: string | null;
	yearsAvailable: string[];
	baseViewId: number;
	setGeodata: (geodata: Geodata) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	addYear: (year: string) => void;
}

interface IBaseState {
	years: string[];
	location: string | null;
	theme: string;
	algorithm: string;
	positiveColors: string;
	negativeColors: string;
	positiveClasses: string;
	negativeClasses: string;
	positiveArrowColor: string;
	negativeArrowColor: string;
	change: boolean;
}

export default class BaseView extends React.Component<IBaseProps, IBaseState> {

	constructor(props: IBaseProps) {
		super(props);
		this.state = {
			years: [],
			location: null,
			theme: 'Von',
			algorithm: 'equidistant',
			positiveColors: 'rot',
			negativeColors: 'blau',
			positiveClasses: '5',
			negativeClasses: '5',
			positiveArrowColor: 'ff0000',
			negativeArrowColor: '0432ff',
			change: true,
		};
		this.change = this.change.bind(this);
		this.addYear = this.addYear.bind(this);
		this.setGeoName = this.setGeoName.bind(this);
	}

	public render(): JSX.Element {
		const results = this.query();
		const timeline = this.queryTimeline();
		const statisticPerYearAusgabe = this.queryStatistics();
		const classification = Classification.getCurrentClassification();
		classification.setLocation(this.state.location);
		classification.setTheme(this.state.theme);
		classification.setQuery(results);
		classification.setAlgorithm(this.state.algorithm);
		classification.setPositiveColors(classification.getColorScheme(this.state.positiveColors, this.state.positiveClasses));
		classification.setNegativeColors(classification.getColorScheme(this.state.negativeColors, this.state.negativeClasses));
		classification.setPositiveArrowColor('#' + this.state.positiveArrowColor);
		classification.setNegativeArrowColor('#' + this.state.negativeArrowColor);
		classification.calculateClassification();
		let attributes: GeoJsonProperties[] = [];
		let fieldNameLoc = this.props.geoName as string;
		let locations: string[] = [];
		const projektinfo = Config.getValue('components', 'projektinfo') == true;
		const systeminfo = Config.getValue('components', 'systeminfo') == true;
		if (this.props.geodata != null && this.props.geoName != null) {
			attributes = this.props.geodata.attributes();
			locations = R.sort(
				(a: string, b: string) => a.localeCompare(b),
				R.map((item) => item![fieldNameLoc], attributes)
			);
		}
		return (
			<div className="p-grid">
				<div className="p-col-12">
					<div>
						<img className="logo" src="./assets/blue_huwlogo.png" />
					</div>
				</div>
				<div className={this.props.space == 'wide' ? 'p-col-2 noprint' : 'p-col-4 noprint'}>
					<Location
						title="Bezugsfläche"
						locations={locations}
						selectedLocation={this.state.location}
						onSelectLocation={(newLocation) => this.setState({ location: newLocation })}
					/>
					<Themes
						themes={['Von', 'Nach', 'Saldi']}
						selected={this.state.theme}
						setTheme={(newTheme) => this.setState({ theme: newTheme })}
					/>
					<Years
						availableYears={this.props.yearsAvailable}
						selected={this.state.years}
						setYears={(newYears) => this.setState({ years: newYears })}
					/>
					<ClassificationSelections
						algorithm={this.state.algorithm}
						positiveColors={this.state.positiveColors}
						negativeColors={this.state.negativeColors}
						positiveClasses={this.state.positiveClasses}
						negativeClasses={this.state.negativeClasses}
						withNegative={this.state.theme == 'Saldi'}
						colorSchemes={classification.getColorSchemes()}
						setAlgorithm={(newAlgorithm) => this.setState({ algorithm: newAlgorithm })}
						setPositiveColorScheme={(newColorScheme) => this.setState({ positiveColors: newColorScheme })}
						setNegativeColorScheme={(newColorScheme) => this.setState({ negativeColors: newColorScheme })}
						setPositiveClasses={(classes) => this.setState({ positiveClasses: classes.substring(0, 1) })}
						setNegativeClasses={(classes) => this.setState({ negativeClasses: classes.substring(0, 1) })}
					/>
					<ArrowColorSelections
						theme={this.state.theme}
						positiveColor={this.state.positiveArrowColor}
						negativeColor={this.state.negativeArrowColor}
						setPositiveColor={(event) => this.setState({ positiveArrowColor: event.value })}
						setNegativeColor={(event) => this.setState({ negativeArrowColor: event.value })}
					/>
				</div>
				<div className={this.props.space == 'wide' ? 'p-col-10' : 'p-col-8'}>
					<DashboardView
						baseViewId={this.props.baseViewId}
						view={this.props.view}
						geodata={this.props.geodata}
						db={this.props.db}
						items={results}
						statisticPerYearAusgabe={statisticPerYearAusgabe}
						timeline={timeline}
						geoName={this.props.geoName}
						geoId={this.props.geoId}
						locations={locations}
						location={this.state.location}
						theme={this.state.theme}
						yearsAvailable={this.props.yearsAvailable}
						yearsSelected={this.state.years}
						onSelectLocation={(newLocation) => this.setState({ location: newLocation })}
						setGeodata={this.props.setGeodata}
						setGeoName={this.setGeoName}
						setGeoId={this.props.setGeoId}
						addYear={this.addYear}
						change={this.change}
					/>
				</div>
			</div>
		);
	}

	private query(): any[] {
		let results: any[] = [];
		if (R.or(R.isNil(this.state.location), R.isEmpty(this.props.yearsAvailable))) {
			return results;
		}
		// disabled because of #2883
		//const years = R.isEmpty(this.state.years) ? this.state.yearsAvailable : this.state.years;
		const years = this.state.years;
		const stringYears = R.join(
			', ',
			R.map((year) => `'${year}'`, years)
		);
		const location = ` ('${this.state.location}') `;
		let query = '';
		if (this.state.theme === 'Von') {
			query =
				`SELECT '${this.state.location}' as Von, Nach, MYSUM(Wert) as Wert FROM matrices ` +
				`WHERE Von IN ${location} AND Jahr IN (${stringYears}) ` +
				`GROUP BY Nach `;
		} else if (this.state.theme === 'Nach') {
			query =
				`SELECT Von, '${this.state.location}' as Nach, MYSUM(Wert) as Wert FROM matrices ` +
				`WHERE Nach IN ${location} AND Jahr IN (${stringYears}) ` +
				`GROUP BY Von `;
		} else if (this.state.theme === 'Saldi') {
			const vonQuery =
				`SELECT '${this.state.location}' as Von, Nach, MYSUM(Wert) as Wert FROM matrices ` +
				`WHERE  Von IN ${location}  AND Jahr IN (${stringYears}) ` +
				`GROUP BY Nach ORDER BY Nach`;
			const nachQuery =
				`SELECT Von, '${this.state.location}' as Nach, MYSUM(Wert) as Wert FROM matrices ` +
				`WHERE Nach IN ${location} AND Jahr IN (${stringYears}) ` +
				`GROUP BY Von ORDER BY Von`;
			const vonResults = this.props.db(vonQuery);
			const nachResults = this.props.db(nachQuery);
			for (let i = 0; i < nachResults.length; i++) {
				let value = nachResults[i].Wert - vonResults[i].Wert;
				if (isNaN(nachResults[i])) value = 0 - vonResults[i].Wert;
				if (isNaN(vonResults[i].Wert)) value = nachResults[i].Wert;
				const saldiItem = { Von: nachResults[i].Von, Nach: nachResults[i].Nach, Wert: value };
				results = R.append(saldiItem, results);
			}
			return results;
		}
		Log.debug('Query: ', query);
		results = this.props.db(query);
		for (let i = 0; i < results.length; i++) {
			if (typeof results[i].Wert == 'undefined') results[i].Wert = Number.NaN;
		}
		console.log(results);
		return results;
	}

	private queryTimeline(): any[] {
		let results: any[] = [];
		let resultsFiltered : any[] = [];
		if (R.or(R.isNil(this.state.location), R.isEmpty(this.props.yearsAvailable))) {
			return results;
		}
		const years = this.state.years;
		const stringYears = R.join(
			', ',
			R.map((year) => `'${year}'`, years)
		);
		let query_zuzug = `SELECT Nach, Jahr, sum(Wert) as zuzug FROM matrices where Nach = '${this.state.location}' AND Von <> Nach GROUP BY Nach, Jahr`;
		let results_zuzug = this.props.db(query_zuzug);
		let query_wegzug = `SELECT Von, Jahr, sum(Wert) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		let results_wegzug = this.props.db(query_wegzug);
		for (let year of this.props.yearsAvailable.sort()) {
			let zuzug = this.getFieldForYear(results_zuzug, year, 'zuzug');
			let wegzug = this.getFieldForYear(results_wegzug, year, 'wegzug');
			results.push({
				'Ort': this.state.location,
				'Jahr': year,
				'Zuzug': zuzug,
				'Wegzug': -wegzug,
				'Saldo': zuzug - wegzug,
			});
		}
		for(let item of results ){
			if (R.contains(item.Jahr, stringYears)){
				resultsFiltered.push(item);
			}
			

		}
		return resultsFiltered;
	}

	private queryStatistics(): any[] {
		let letztesJahr: number = 0;
		let zuzüge = 0;
		let wegzüge = 0;
		let meisteZuzüge = 0;
		let meisteWegzüge = 0;
		let mean = 0;
		let medianZuzüge = 0;
		let medianWegzüge = 0;
		let meanZuzüge = 0;
		let meanWegzüge = 0;
		let indexPerYear = 0;
		let results: any[] = [];
		let medianZuzügeArray: any[] = [];
		let medianWegzügeArray: any[] = [];
		if (R.or(R.isNil(this.state.location), R.isEmpty(this.props.yearsAvailable))) {
			return results;
		}
		Log.debug("Statistik!!!");
		const query_zuzug = `SELECT Von, Nach, Jahr, sum(Wert) as zuzug FROM matrices where Nach = '${this.state.location}' GROUP BY Jahr, Von ORDER BY Jahr asc`;
		const results_zuzug = this.props.db(query_zuzug);
		Log.debug(results_zuzug);
		const query_wegzug = `SELECT Von, Nach, Jahr, sum(Wert) as wegzug FROM matrices where Von = '${this.state.location}' GROUP BY Jahr, Nach ORDER BY Jahr asc`;
		const results_wegzug = this.props.db(query_wegzug);
		Log.debug(results_wegzug);
		letztesJahr = results_zuzug[0].Jahr;
		//console.log("Jahr: " + results_zuzug[0].Jahr + "; zuzug: " + results_zuzug[0].Von);
		for (let i = 0; i < results_zuzug.length; i++) {
			if (letztesJahr == results_zuzug[i].Jahr) {
				zuzüge = zuzüge + results_zuzug[i].zuzug;
				wegzüge = wegzüge + results_wegzug[i].wegzug;
				medianZuzügeArray[i] = results_zuzug[i].zuzug;
				medianWegzügeArray[i] = results_wegzug[i].wegzug;
				if (meisteZuzüge < results_zuzug[i].zuzug) {
					meisteZuzüge = results_zuzug[i].zuzug;
				}
				if (meisteWegzüge < results_wegzug[i].wegzug) {
					meisteWegzüge = results_wegzug[i].wegzug;
				}
				indexPerYear += 1;
			} else {
				mean = (zuzüge - wegzüge) / indexPerYear;
				meanZuzüge = zuzüge / indexPerYear;
				meanWegzüge = wegzüge / indexPerYear;
				let valueszuzug = medianZuzügeArray.sort();
				let lowerzuzug: number = valueszuzug[Math.floor(indexPerYear/2)];
				let higherzuzug: number = valueszuzug[Math.ceil(indexPerYear/2)];
				medianZuzüge = (lowerzuzug + higherzuzug) / 2;
				let valueswegzug = medianZuzügeArray.sort();
				let lowerwegzug: number = valueswegzug[Math.floor(indexPerYear/2)];
				let higherwegzug: number = valueswegzug[Math.ceil(indexPerYear/2)];
				medianZuzüge = (lowerwegzug + higherwegzug) / 2;
				const saldiItem = {
					Jahr: letztesJahr,
					Mean: mean,
					MeanZuzüge: meanZuzüge,
					MeanWegzüge: meanWegzüge,
					MedianZuzüge: medianZuzüge,
					MedianWegzüge: medianWegzüge,
					min: meisteWegzüge,
					max: meisteZuzüge,
				};
				results = R.append(saldiItem, results);
				console.log('letztesJahr: ' + letztesJahr);
				console.log('summe: ' + (zuzüge - wegzüge));
				console.log('indexperYear: ' + indexPerYear);
				indexPerYear = 0;
				zuzüge = 0;
				wegzüge = 0;
				meisteZuzüge = 0;
				meisteWegzüge = 0;
				zuzüge = zuzüge + results_zuzug[i].zuzug;
				wegzüge = wegzüge + results_wegzug[i].wegzug;
				if (meisteZuzüge < results_zuzug[i].zuzug) {
					meisteZuzüge = results_zuzug[i].zuzug;
				}
				if (meisteWegzüge < results_wegzug[i].wegzug) {
					meisteWegzüge = results_wegzug[i].wegzug;
				}
				indexPerYear += 1;
			}
			letztesJahr = results_zuzug[i].Jahr;
		}
		console.log('letztesJahr: ' + letztesJahr);
		console.log('summe: ' + (zuzüge - wegzüge));
		console.log('indexperYear: ' + indexPerYear);
		mean = (zuzüge - wegzüge) / indexPerYear;
		meanZuzüge = zuzüge / indexPerYear;
		meanWegzüge = wegzüge / indexPerYear;
		if (meisteZuzüge < results_zuzug[results_zuzug.length - 1].zuzug) {
			meisteZuzüge = results_zuzug[results_zuzug.length - 1].zuzug;
		}
		if (meisteWegzüge < results_wegzug[results_wegzug.length - 1].wegzug) {
			meisteWegzüge = results_wegzug[results_wegzug.length - 1].wegzug;
		}
		let values = medianZuzügeArray.sort();
		let lower: number = values[Math.floor(indexPerYear)];
		let higher: number = values[Math.ceil(indexPerYear)];
		medianZuzüge = (lower + higher) / 2;
		let valueswegzug = medianZuzügeArray.sort();
		let lowerwegzug: number = valueswegzug[Math.floor(indexPerYear)];
		let higherwegzug: number = valueswegzug[Math.ceil(indexPerYear)];
		medianZuzüge = (lowerwegzug + higherwegzug) / 2;
		const saldiItem = {
			Jahr: letztesJahr,
			Mean: mean,
			MeanZuzüge: meanZuzüge,
			MeanWegzüge: meanWegzüge,
			MedianZuzüge: medianZuzüge,
			MedianWegzüge: medianWegzüge,
			min: meisteWegzüge,
			max: meisteZuzüge,
		};
		results = R.append(saldiItem, results);
		return results;
	}

	private getFieldForYear(data: any[], year: string, field: string) {
		for (let item of data) {
			if (item['Jahr'] === year) {
				return item[field];
			}
		}
		return 0;
	}

	private change() {
		this.setState({ change: this.state.change ? false : true });
	}

	private addYear(year: string) {
		this.props.addYear(year);
		if (this.state.years.length === 0) this.setState({ years: [year]});
	}

	private setGeoName(geoName: string) {
		this.props.setGeoName(geoName);
		this.setFirstLocation(geoName);
	}

	private setFirstLocation(geoName: string)
	{
		let locations: string[] = [];
		if (this.props.geodata != null && geoName != null) {
			let attributes: GeoJsonProperties[] = [];
			attributes = this.props.geodata.attributes();
			locations = R.sort(
				(a: string, b: string) => a.localeCompare(b),
				R.map((item) => item![geoName], attributes)
			);
		}
		if (locations.length > 0) this.setState({ location: locations[0] })
	}

}
