import R from 'ramda';
import React from 'react';
import { TabView,TabPanel } from 'primereact/tabview';

import Geodata from '../../model/Geodata';
import { GeoJsonProperties } from 'geojson';

import Classification from '../../data/Classification';
import MessageList from '../../data/MessageList';

import Location from '../selections/Location';
import Themes from '../selections/Themes';
import Years from '../selections/Years';
import Messages from '../elements/Messages';
import ClassificationSelections from '../selections/ClassificationSelections';
import DashboardView from './DashboardView';

import Config from '../../config';
import Log from '../../log';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IBaseProps extends WithNamespaces {
	db: alaSQLSpace.AlaSQL;
	view: string;
	space: string;
	geodata: Geodata | null;
	geoName: string | null;
	geoId: string | null;
	shapefilename: string;
	yearsAvailable: string[];
	baseViewId: number;
	setGeodata: (geodata: Geodata) => void;
	setShapefileName: (shapefilename: string) => void;
	setGeoName: (geoName: string) => void;
	setGeoId: (geoId: string) => void;
	addYear: (year: string) => void;
	populationDataLoaded: boolean;
	setPopulationDataLoaded: () => void;
}

interface IBaseState {
	years: string[];
	location: string | null;
	theme: string;
	dataProcessing: string;
	migrationsInside: boolean;
	algorithm: string;
	positiveColors: string;
	negativeColors: string;
	positiveClasses: string;
	negativeClasses: string;
	change: boolean;
	classcountset: boolean;
	updateclasscount: boolean;
	activeLeftTab: number;
}

// export default 
class BaseView extends React.Component<IBaseProps, IBaseState> {

	constructor(props: IBaseProps) {
		const {t}:any = props ;
		super(props);
		this.state = {
			years: [],
			location: null,
			// theme: t('from'),
			theme: 'Von',
			dataProcessing: 'absolute',
			migrationsInside: true,
			algorithm: 'equidistant',
			positiveColors: 'rot',
			negativeColors: 'blau',
			positiveClasses: '5',
			negativeClasses: '5',
			change: true,
			classcountset: false,
			updateclasscount: false,
			activeLeftTab: 0,
		};
		this.change = this.change.bind(this);
		this.addYear = this.addYear.bind(this);
		this.setGeoName = this.setGeoName.bind(this);
		this.setClassCount = this.setClassCount.bind(this);
		this.setLocation = this.setLocation.bind(this);
		this.setTheme = this.setTheme.bind(this);
		this.setYears = this.setYears.bind(this);
	}

	public render(): JSX.Element {
		const {t}:any = this.props ;
		const results = this.query();
		const timeline = this.queryTimeline();
		const statisticPerYearAusgabe = this.queryStatistics();
		const classification = Classification.getCurrentClassification();
		classification.setLocation(this.state.location);
		classification.setTheme(this.state.theme);
		classification.setQuery(results);
		classification.setAlgorithm(this.state.algorithm);
		classification.setDataProcessing(this.state.dataProcessing);
		classification.setPositiveColors(classification.getColorScheme(this.state.positiveColors, this.state.positiveClasses));
		classification.setNegativeColors(classification.getColorScheme(this.state.negativeColors, this.state.negativeClasses));
		classification.calculateClassification();
		this.setRecommendedClassCount();
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
					<Messages change={this.change} />
				</div>
				<div className={this.props.space == 'wide' ? 'p-col-2 noprint' : 'p-col-4 noprint'}>
					<div>
						<img src="../assets/blue_huwlogo.png" />
					</div>
					<TabView activeIndex={this.state.activeLeftTab} onTabChange={(e) => this.setState({ activeLeftTab: e.index })} className="selectionstab">
						<TabPanel header={t('baseView.selection')} contentClassName="selectionstab">
						{/* <TabPanel header="Auswahl" contentClassName="selectionstab"> */}
							<Location
								title={t('baseView.polygon')}
								// title="Bezugsfläche"
								locations={locations}
								selectedLocation={this.state.location}
								onSelectLocation={(newLocation) => this.setLocation(newLocation) }
								migrationsInside={this.state.migrationsInside}
								setMigrationsInside={(status) => this.setState({ migrationsInside: status }) }
							/>
							<Themes
								themes={['Von', 'Nach', 'Saldi']}
								selectedTheme={this.state.theme}
								setTheme={(newTheme) => this.setTheme(newTheme) }
								selected={this.state.dataProcessing}
								setDataProcessing={(value) => this.setState({ dataProcessing: value }) }
								populationDataLoaded={this.props.populationDataLoaded}
							/>
							<Years
								availableYears={this.props.yearsAvailable}
								selected={this.state.years}
								setYears={(newYears) => this.setYears(newYears) }
							/>
						</TabPanel>
						<TabPanel header={t('baseView.representation')}contentClassName="selectionstab">
						{/* <TabPanel header="Darstellung" contentClassName="selectionstab"> */}
							<ClassificationSelections
								algorithm={this.state.algorithm}
								positiveColors={this.state.positiveColors}
								negativeColors={this.state.negativeColors}
								positiveClasses={this.state.positiveClasses}
								negativeClasses={this.state.negativeClasses}
								withNegative={this.state.theme == 'Saldi'}
								automaticButton={this.state.classcountset}
								colorSchemes={classification.getColorSchemes()}
								setAlgorithm={(newAlgorithm) => this.setState({ algorithm: newAlgorithm })}
								setPositiveColorScheme={(newColorScheme) => this.setState({ positiveColors: newColorScheme })}
								setNegativeColorScheme={(newColorScheme) => this.setState({ negativeColors: newColorScheme })}
								setPositiveClasses={(classes) => this.setClassCount(true, classes)}
								setNegativeClasses={(classes) => this.setClassCount(false, classes)}
								resetAutomaticClasses={(automatic) => this.setState({ classcountset: !automatic, updateclasscount: automatic })}
							/>
						</TabPanel>
					</TabView>
				</div>
				<div className={this.props.space == 'wide' ? 'p-col-10' : 'p-col-8'}>
					<DashboardView
						dataProcessing={this.state.dataProcessing}
						baseViewId={this.props.baseViewId}
						view={this.props.view}
						geodata={this.props.geodata}
						db={this.props.db}
						items={results}
						statisticPerYearAusgabe={statisticPerYearAusgabe}
						timeline={timeline}
						geoName={this.props.geoName}
						geoId={this.props.geoId}
						shapefilename={this.props.shapefilename}
						locations={locations}
						location={this.state.location}
						theme={this.state.theme}
						yearsAvailable={this.props.yearsAvailable}
						yearsSelected={this.state.years}
						onSelectLocation={(newLocation) => this.setLocation(newLocation) }
						setGeodata={this.props.setGeodata}
						setShapefileName={this.props.setShapefileName}
						setGeoName={this.setGeoName}
						setGeoId={this.props.setGeoId}
						addYear={this.addYear}
						change={this.change}
						migrationsInside={this.state.migrationsInside}
						setPopulationDataLoaded={this.props.setPopulationDataLoaded}
					/>
				</div>
			</div>
		);
	}

	private standardizeValues(value: number): number
	{
		if ((this.state.dataProcessing === 'wanderungsrate') || (this.state.dataProcessing === 'ratevon') || (this.state.dataProcessing === 'ratenach')) return Math.round((value + Number.EPSILON) * 1000) / 1000;
		if (this.state.dataProcessing === 'absolute') return Math.round(value);
		return value;
	}

	private constructQuery(target: string): string {
		// disabled because of #2883
		//const years = R.isEmpty(this.state.years) ? this.state.yearsAvailable : this.state.years;
		const {t}:any = this.props ;
		const years = this.state.years;
		const stringYears = R.join(
			', ',
			R.map((year) => `'${year}'`, years)
		);
		const migrationsInsideClause = (this.state.migrationsInside) ? `` : ` AND Von <> Nach `;
		//const location = ` ('${this.state.location}') `;
		if (target === 'Von')
		{
			if (this.state.dataProcessing === 'wanderungsrate') return `SELECT '${this.state.location}' as Von, Nach, ROUND(MYAVG(RateVon), 3) as Wert FROM matrices WHERE Von = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			if (this.state.dataProcessing === 'ratevon') return `SELECT '${this.state.location}' as Von, Nach, ROUND(MYAVG(RateVon), 3) as Wert FROM matrices WHERE Von = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			if (this.state.dataProcessing === 'ratenach') return `SELECT '${this.state.location}' as Von, Nach, ROUND(MYAVG(RateNach), 3) as Wert FROM matrices WHERE Von = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			// fallback for absolute and other values
			return `SELECT '${this.state.location}' as Von, Nach, MYSUM(Wert) as Wert FROM matrices WHERE Von = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
		}
		if (target === 'Nach')
		{
			if (this.state.dataProcessing === 'wanderungsrate') return `SELECT Von, '${this.state.location}' as Nach, ROUND(MYAVG(RateNach), 3) as Wert FROM matrices WHERE Nach = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			if (this.state.dataProcessing === 'ratevon') return `SELECT Von, '${this.state.location}' as Nach, ROUND(MYAVG(RateVon), 3) as Wert FROM matrices WHERE Nach = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			if (this.state.dataProcessing === 'ratenach') return `SELECT Von, '${this.state.location}' as Nach, ROUND(MYAVG(RateNach), 3) as Wert FROM matrices WHERE Nach = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			// fallback for absolute and other values
			return `SELECT Von, '${this.state.location}' as Nach, MYSUM(Wert) as Wert FROM matrices WHERE Nach = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
		}
		return '';
	}

	private query(): any[] {
		const {t}:any = this.props ;
		let results: any[] = [];
		if (R.or(R.isNil(this.state.location), R.isEmpty(this.props.yearsAvailable))) {
			return results;
		}
		let query = '';
		if (this.state.theme === 'Von') {
			query = this.constructQuery('Von');
		} else if (this.state.theme === 'Nach') {
			query = this.constructQuery('Nach');
		} else if (this.state.theme === 'Saldi') {
			const years = this.state.years;
			const stringYears = R.join(
				', ',
				R.map((year) => `'${year}'`, years)
			);
			const migrationsInsideClause = (this.state.migrationsInside) ? `` : ` AND Von <> Nach `;
			const vonQuery = `SELECT '${this.state.location}' as Von, Nach, MYSUM(Wert) as Wert FROM matrices WHERE Von = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			const nachQuery = `SELECT Von, '${this.state.location}' as Nach, MYSUM(Wert) as Wert FROM matrices WHERE Nach = '${this.state.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			const vonResults = this.props.db(vonQuery);
			const nachResults = this.props.db(nachQuery);
			const popquery = `SELECT MYSUM(Wert) as population FROM population WHERE Area = '${this.state.location}' AND Jahr IN (${stringYears}) GROUP BY Area`;
			const popResults = this.props.db(popquery);
			for (let i = 0; i < nachResults.length; i++) {
				let value = nachResults[i].Wert - vonResults[i].Wert;
				if (isNaN(value))
				{
					if (isNaN(nachResults[i].Wert)) value = 0 - vonResults[i].Wert;
					if (isNaN(vonResults[i].Wert)) value = nachResults[i].Wert;
				}
				if ((this.state.dataProcessing === 'wanderungsrate') || (this.state.dataProcessing === 'ratevon') || (this.state.dataProcessing === 'ratenach')) {
					value = value * 1000 / popResults[0].population;

				}
				const saldiItem = { Von: nachResults[i].Von, Nach: nachResults[i].Nach, Wert: this.standardizeValues(value) };
				results = R.append(saldiItem, results);
			}
			for (let i = 0; i < results.length; i++) {
				if (typeof results[i].Wert == 'undefined') results[i].Wert = Number.NaN;
			}
			return results;
		}
		Log.debug('Query: ', query);
		results = this.props.db(query);
		for (let i = 0; i < results.length; i++) {
			if (typeof results[i].Wert == 'undefined') results[i].Wert = Number.NaN;
			results[i].Wert = this.standardizeValues(results[i].Wert);
		}
		Log.debug('results: ', query);
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
		if (this.state.dataProcessing === 'wanderungsrate') query_zuzug = `SELECT Nach, Jahr, ROUND(MYAVG(RateNach), 3) as zuzug FROM matrices where Nach = '${this.state.location}' AND Von <> Nach GROUP BY Nach, Jahr`;
		// if (this.state.dataProcessing === 'ratevon') query_zuzug = `SELECT Nach, Jahr, ROUND(MYAVG(RateVon), 3) as zuzug FROM matrices where Nach = '${this.state.location}' AND Von <> Nach GROUP BY Nach, Jahr`;
		// if (this.state.dataProcessing === 'ratenach') query_zuzug = `SELECT Nach, Jahr, ROUND(MYAVG(RateNach), 3) as zuzug FROM matrices where Nach = '${this.state.location}' AND Von <> Nach GROUP BY Nach, Jahr`;
		let results_zuzug = this.props.db(query_zuzug);
		let query_zuzug_wert = `SELECT Nach, Jahr, sum(Wert) as zuzug FROM matrices where Nach = '${this.state.location}' AND Von <> Nach GROUP BY Nach, Jahr`;
		let results_zuzug_wert = this.props.db(query_zuzug_wert);

		let query_wegzug = `SELECT Von, Jahr, sum(Wert) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		if (this.state.dataProcessing === 'wanderungsrate') query_wegzug = `SELECT Von, Jahr, ROUND(MYAVG(RateVon), 3) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		// if (this.state.dataProcessing === 'ratevon') query_wegzug = `SELECT Von, Jahr, ROUND(MYAVG(RateVon), 3) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		// if (this.state.dataProcessing === 'ratenach') query_wegzug = `SELECT Von, Jahr, ROUND(MYAVG(RateNach), 3) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		let results_wegzug = this.props.db(query_wegzug);
		let query_wegzug_wert = `SELECT Von, Jahr, sum(Wert) as wegzug FROM matrices where Von = '${this.state.location}' AND Von <> Nach GROUP BY Von, Jahr`;
		let results_wegzug_wert = this.props.db(query_wegzug_wert);

		let wanderungsRate: boolean = (this.state.dataProcessing === "wanderungsrate") || (this.state.dataProcessing === "ratevon") || (this.state.dataProcessing === "ratenach");
		const populationqueryYear = `SELECT Jahr as Jahr, MYSUM(Wert) as population FROM population WHERE Area = '${this.state.location}' AND Jahr IN (${stringYears}) GROUP BY Jahr`;
		const populationResultsYear = this.props.db(populationqueryYear);

		for (let year of this.props.yearsAvailable.sort()) {
			let zuzug = this.getFieldForYear(results_zuzug, year, 'zuzug');
			let wegzug = this.getFieldForYear(results_wegzug, year, 'wegzug');
			let zuzug_wert = this.getFieldForYear(results_zuzug_wert, year, 'zuzug');
			let wegzug_wert = this.getFieldForYear(results_wegzug_wert, year, 'wegzug');
			let population = this.getFieldForYear(populationResultsYear, year, 'population');
			let saldoRate = (zuzug_wert - wegzug_wert)*1000/population;
			// let saldoRate = this.state.dataProcessing === "ratevon" ? -(zuzug_wert - wegzug_wert)*1000/population : (zuzug_wert - wegzug_wert)*1000/population;
			results.push({
				'Ort': this.state.location,
				'Jahr': year,
				'Zuzug': this.standardizeValues(zuzug),
				'Wegzug': this.standardizeValues(-wegzug),
				'Saldo': wanderungsRate ?  this.standardizeValues(saldoRate) : this.standardizeValues(zuzug - wegzug),
			});
		}
		for(let item of results ){
			if (R.contains(item.Jahr, stringYears)){
				resultsFiltered.push(item);
			}
		}
		return resultsFiltered;
	}

	private compareNumbers(a: number, b: number) {
		return a - b;
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
		let indexPerYearZuzug = 0;
		let indexPerYearWegzug = 0;
		let results: any[] = [];
		let medianZuzügeArray: any[] = [];
		let medianWegzügeArray: any[] = [];
		if (R.or(R.isNil(this.state.location), R.isEmpty(this.props.yearsAvailable))) {
			return results;
		}
		let query_zuzug = `SELECT Von, Nach, Jahr, Wert as zuzug FROM matrices where Nach = '${this.state.location}' ORDER BY Jahr asc`;
		if (this.state.dataProcessing === 'wanderungsrate') query_zuzug = `SELECT Von, Nach, Jahr, ROUND(RateNach, 3) as zuzug FROM matrices where Nach = '${this.state.location}' ORDER BY Jahr asc`;
		if (this.state.dataProcessing === 'ratevon') query_zuzug = `SELECT Von, Nach, Jahr, ROUND(RateVon, 3) as zuzug FROM matrices where Nach = '${this.state.location}' ORDER BY Jahr asc`;
		if (this.state.dataProcessing === 'ratenach') query_zuzug = `SELECT Von, Nach, Jahr, ROUND(RateNach, 3) as zuzug FROM matrices where Nach = '${this.state.location}' ORDER BY Jahr asc`;
		const results_zuzug = this.props.db(query_zuzug);
		Log.debug('queryStatistics()→results_zuzug', results_zuzug);
		let query_wegzug = `SELECT Von, Nach, Jahr, Wert as wegzug FROM matrices where Von = '${this.state.location}' ORDER BY Jahr asc`;
		if (this.state.dataProcessing === 'wanderungsrate') query_wegzug = `SELECT Von, Nach, Jahr, ROUND(RateVon, 3) as wegzug FROM matrices where Von = '${this.state.location}' ORDER BY Jahr asc`;
		if (this.state.dataProcessing === 'ratevon') query_wegzug = `SELECT Von, Nach, Jahr, ROUND(RateVon, 3) as wegzug FROM matrices where Von = '${this.state.location}' ORDER BY Jahr asc`;
		if (this.state.dataProcessing === 'ratenach') query_wegzug = `SELECT Von, Nach, Jahr, ROUND(RateNach, 3) as wegzug FROM matrices where Von = '${this.state.location}' ORDER BY Jahr asc`;
		const results_wegzug = this.props.db(query_wegzug);
		if ((results_zuzug == null) || (results_wegzug == null)) return results;
		Log.debug('queryStatistics()→results_wegzug', results_wegzug);
		letztesJahr = results_zuzug[0].Jahr;
		//console.log("Jahr: " + results_zuzug[0].Jahr + "; zuzug: " + results_zuzug[0].Von);
		for (let i = 0; i < results_zuzug.length; i++) {
			if (letztesJahr == results_zuzug[i].Jahr) {
				if ((!isNaN(results_zuzug[i].zuzug)) && (!isNaN(zuzüge + results_zuzug[i].zuzug))) {
					zuzüge = zuzüge + results_zuzug[i].zuzug;
					medianZuzügeArray.push(results_zuzug[i].zuzug);
					indexPerYearZuzug += 1;
				}
				if ((!isNaN(results_wegzug[i].wegzug)) && (!isNaN(wegzüge + results_wegzug[i].wegzug))) {
					wegzüge = wegzüge + results_wegzug[i].wegzug;
					medianWegzügeArray.push(results_wegzug[i].wegzug);
					indexPerYearWegzug += 1;
				}
				if (meisteZuzüge < results_zuzug[i].zuzug) {
					meisteZuzüge = results_zuzug[i].zuzug;
				}
				if (meisteWegzüge < results_wegzug[i].wegzug) {
					meisteWegzüge = results_wegzug[i].wegzug;
				}
				if ((!isNaN(results_zuzug[i].zuzug)) || (!isNaN(results_wegzug[i].wegzug))) indexPerYear += 1;
			} else {
				Log.debug('medianZuzügeArray', medianZuzügeArray);
				Log.debug('medianWegzügeArray', medianWegzügeArray);
				mean = (zuzüge - wegzüge) / indexPerYear;
				meanZuzüge = zuzüge / indexPerYearZuzug;
				meanWegzüge = wegzüge / indexPerYearWegzug;
				let valueszuzug = medianZuzügeArray.sort(this.compareNumbers);
				let lowerzuzug: number = valueszuzug[Math.floor((indexPerYearZuzug - 1) / 2)];
				let higherzuzug: number = valueszuzug[Math.ceil((indexPerYearZuzug - 1) / 2)];
				medianZuzüge = (lowerzuzug + higherzuzug) / 2;
				let valueswegzug = medianWegzügeArray.sort(this.compareNumbers);
				let lowerwegzug: number = valueswegzug[Math.floor((indexPerYearWegzug - 1) / 2)];
				let higherwegzug: number = valueswegzug[Math.ceil((indexPerYearWegzug - 1) / 2)];
				medianWegzüge = (lowerwegzug + higherwegzug) / 2;
				Log.debug('valueszuzug', valueszuzug);
				Log.debug('valueswegzug', valueswegzug);
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
				Log.debug('letztesJahr', letztesJahr);
				Log.debug('MeanZuzüge', meanZuzüge);
				Log.debug('summe', (zuzüge - wegzüge));
				Log.debug('indexperYear', indexPerYear);
				indexPerYear = 0;
				indexPerYearZuzug = 0;
				indexPerYearWegzug = 0;
				zuzüge = 0;
				wegzüge = 0;
				medianZuzügeArray = [];
				medianWegzügeArray = [];
				meisteZuzüge = 0;
				meisteWegzüge = 0;
				if (!isNaN(results_zuzug[i].zuzug)) {
					zuzüge = zuzüge + results_zuzug[i].zuzug;
					medianZuzügeArray.push(results_zuzug[i].zuzug);
					indexPerYearZuzug += 1;
				}
				if (!isNaN(results_wegzug[i].wegzug)) {
					wegzüge = wegzüge + results_wegzug[i].wegzug;
					medianWegzügeArray.push(results_wegzug[i].wegzug);
					indexPerYearWegzug += 1;
				}
				if (meisteZuzüge < results_zuzug[i].zuzug) {
					meisteZuzüge = results_zuzug[i].zuzug;
				}
				if (meisteWegzüge < results_wegzug[i].wegzug) {
					meisteWegzüge = results_wegzug[i].wegzug;
				}
				if ((!isNaN(results_zuzug[i].zuzug)) || (!isNaN(results_wegzug[i].wegzug))) indexPerYear += 1;
			}
			letztesJahr = results_zuzug[i].Jahr;
		}
		Log.debug('medianZuzügeArray', medianZuzügeArray);
		Log.debug('medianWegzügeArray', medianWegzügeArray);
		mean = (zuzüge - wegzüge) / indexPerYear;
		meanZuzüge = zuzüge / indexPerYearZuzug;
		meanWegzüge = wegzüge / indexPerYearWegzug;
		let valueszuzug = medianZuzügeArray.sort(this.compareNumbers);
		let lowerzuzug: number = valueszuzug[Math.floor((indexPerYearZuzug - 1) / 2)];
		let higherzuzug: number = valueszuzug[Math.ceil((indexPerYearZuzug - 1) / 2)];
		medianZuzüge = (lowerzuzug + higherzuzug) / 2;
		let valueswegzug = medianWegzügeArray.sort(this.compareNumbers);
		let lowerwegzug: number = valueswegzug[Math.floor((indexPerYearWegzug - 1) / 2)];
		let higherwegzug: number = valueswegzug[Math.ceil((indexPerYearWegzug - 1) / 2)];
		medianWegzüge = (lowerwegzug + higherwegzug) / 2;
		Log.debug('valueszuzug', valueszuzug);
		Log.debug('valueswegzug', valueswegzug);
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
		Log.debug('letztesJahr', letztesJahr);
		Log.debug('summe', (zuzüge - wegzüge));
		Log.debug('indexperYear', indexPerYear);
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
		this.setState({ updateclasscount: true });
	}

	private setGeoName(geoName: string) {
		this.props.setGeoName(geoName);
		this.setFirstLocation(geoName);
	}

	private setClassCount(positive: boolean, count: string)
	{
		let optimal = Classification.getCurrentClassification().calculateSturgesRule(positive);
		let result = count.substring(0, 1);
		if ((this.props.geodata != null) && (this.state.years.length > 0) && (optimal != parseInt(result, 10)) && (!this.state.classcountset)) MessageList.getMessageList().addMessage('Die empfohlene Anzahl Klassen ist ' + optimal + '. Zu viele Klassen können eventuell zu gleichen Werten oder NaN bei Klassengrenzen führen.', 'warning');
		this.setState({ classcountset: true });
		if (positive) this.setState({ positiveClasses: result });
		else this.setState({ negativeClasses: result });
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
		if (locations.length > 0) this.setState({ location: locations[0] });
		this.setState({ updateclasscount: true });
	}

	private setLocation(newLocation: string) {
		this.setState({ location: newLocation });
		this.setState({ updateclasscount: true });
	}

	private setTheme(newTheme: string) {
		this.setState({ theme: newTheme });
		this.setState({ updateclasscount: true });
	}

	private setYears(newYears: string[]) {
		this.setState({ years: newYears });
		this.setState({ updateclasscount: true });
	}

	private setRecommendedClassCount() {
		if (!this.state.updateclasscount) return;
		this.setState({ updateclasscount: false });
		if (this.state.classcountset) return;
		const classification = Classification.getCurrentClassification();
		let positiveClassCount = '' + classification.calculateSturgesRule(true);
		Log.trace('positiveClassCount:', positiveClassCount);
		this.setState({ positiveClasses: positiveClassCount });
		let negativeClassCount = '' + classification.calculateSturgesRule(false);
		Log.trace('negativeClassCount:', negativeClassCount);
		this.setState({ negativeClasses: negativeClassCount });
	}

}
export default withNamespaces()(BaseView);
