import BaseData from "../../data/BaseData";
import * as React from "react";
import R from 'ramda';

import { Dropdown } from "primereact/dropdown";
import * as d3 from 'd3';

import D3IndexValuesChart from "./D3IndexValuesChart";
import ContainerDimensions from 'react-container-dimensions';

import Log from '../../log';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";


export interface ID3IndexViewProps extends WithNamespaces {
	basedata: BaseData;
	db: alaSQLSpace.AlaSQL;
	location: string | null;
	theme: string;
	yearsAvailable: string[];
	locations: string[];
	vizID: number;
	baseViewId: number;
	yearsSelected: string[];
	migrationsInside: boolean;
	dataProcessing:string;
}

interface ID3IndexViewState {
	indexValue: number;
	type: string;
	referenceYear: string;
	referenceLocation: string;
}

// export default 
class D3IndexView extends React.Component<ID3IndexViewProps, ID3IndexViewState>
{

	private types = [
		{label: "Jahr", value: "year"},
		{label: "Raumeinheit", value: "location"},
	];


	constructor(props: ID3IndexViewProps)
	{
		super(props);
		this.state =
		{
			indexValue: 0,
			type: 'year',
			referenceYear: this.props.yearsAvailable[0],
			referenceLocation: this.props.locations[0],
		};
		this.setType = this.setType.bind(this);
		this.setYear = this.setYear.bind(this);
		this.setLocation = this.setLocation.bind(this);
	}

	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		let data = this.queryIndex();
		// Log.debug("index value data: ", data);
		let selector = null;
		if (this.state.type === "year") selector = this.createYearSelector();
		else if (this.state.type === "location") selector = this.createRegionSelector();
		else selector = this.createYearSelector();
		let view = this.createView(data);
		let refText : string = this.state.type === "location" ? this.state.referenceLocation : t('index.yearTitle') + this.state.referenceYear;
		// let refText : string = this.state.type === "location" ? this.state.referenceLocation : " Jahr " + this.state.referenceYear;
		let themeTitel = this.props.theme === "Von" ? t('index.themeFrom') : this.props.theme === "Nach" ? t('index.themeTo') : this.props.theme === "Saldi" ? t('index.themeSaldi') : "";
		// let themeTitel = this.props.theme === "Von" ? "Wegzüge aus" : this.props.theme === "Nach" ? "Zuzüge nach" : this.props.theme === "Saldi" ? "Saldi für" : "";
		let typesRender = [
			{label: "Jahr", value: "year", labelTranslated: t('index.labelYear')},
			{label: "Raumeinheit", value: "location", labelTranslated: t('index.labelSpace')},
		];return (
			<div>
				<h3>{themeTitel}  {this.props.location}, {t('index.indexvalue')}: {refText} (=100%) </h3>
				{/* <h3>{themeTitel}  {this.props.location}, Indexwert: {refText} (=100%) </h3> */}
				<div className="noprint">
					{t('index.select')}
					{/* Auswahl Indexwert: */}
					&nbsp;
					<Dropdown optionLabel="labelTranslated" value={this.getType()} options={typesRender} onChange={this.setType} />
					{/* <Dropdown optionLabel="label" value={this.getType()} options={this.types} onChange={this.setType} /> */}
					&nbsp;
					{selector}
					&nbsp;
					<hr />
				</div>
				{view}
			</div>
		);
	}



	private createYearSelector() {
		const options = this.props.yearsAvailable.map((option: string) => {
			return { value: option, label: option};
		});
		return (
			<Dropdown optionLabel="label" value={this.state.referenceYear} options={options} onChange={this.setYear} />
		);
	}

	private createRegionSelector() {
		const options = this.props.locations.map((option: string) => {
			return { value: option, label: option};
		});
		const selectzedLocation = this.props.location;
		const optionsFiltered = options.filter(function(item) {
			return item.label !== selectzedLocation
		});
		return (
			<Dropdown optionLabel="label" value={this.state.referenceLocation} options={options} onChange={this.setLocation} style={{ width: "15em" }} />
		);
	}

	private createView(data: any[])
	{
		return this.createD3ChartView(data);
	}


	private createD3ChartView(data: any[])
	{

		return (
			<div className="p-grid">

				<div id="chartDiv" className="p-col-12">
						  <ContainerDimensions>
								{ ({ width, height }) =>
							<D3IndexValuesChart
							basedata={this.props.basedata}
							db={this.props.db}
							theme={this.props.theme}
							location={this.props.location} locations={this.props.locations}
							yearsAvailable={this.props.yearsAvailable}
							baseViewId={this.props.baseViewId} vizID={this.props.vizID}
							width={ width}
							height = {this.state.type === 'year' ? 450: 550}
							data={data}
							referenceYear={this.state.referenceYear}
							referenceLocation={this.state.referenceLocation}
							type = {this.state.type}
							yearsSelected = {this.getYearsSelected()} />
								}
						  </ContainerDimensions>


				</div>

			</div>

		);
	}


	private constructQuery(type: string, theme: string)
	{
		const years = this.props.yearsSelected;
		const stringYears = R.join(
			', ',
			R.map((year) => `'${year}'`, years)
		);
		const migrationsInsideClause = (this.props.migrationsInside) ? `` : ` AND Von <> Nach `;
		// const migrationsInsideOff = ` AND Von <> Nach `;
		Log.debug("stringYears in constructQuery : ", stringYears);
		if (type === "year")
		{
			if((this.props.dataProcessing === 'wanderungsrate') || (this.props.dataProcessing === 'ratevon') || (this.props.dataProcessing === 'ratenach')){
				if (theme === "Von") return  `SELECT Jahr as label, ROUND(AVG(RateVon), 3) as result FROM matrices where Von = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			if (theme === "Nach") return `SELECT Jahr as label, ROUND(AVG(RateNach), 3) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			}
			// if (this.props.dataProcessing === 'ratevon'){
			// 	if (theme === "Von") return  `SELECT Jahr as label, ROUND(AVG(RateVon), 3) as result FROM matrices where Von = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			// 	if (theme === "Nach") return `SELECT Jahr as label, ROUND(AVG(RateNach), 3) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			// } 
			// if (this.props.dataProcessing === 'ratenach') {
			// 	if (theme === "Von") return  `SELECT Jahr as label, ROUND(AVG(RateNach), 3) as result FROM matrices where Von = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			// 	if (theme === "Nach") return `SELECT Jahr as label, ROUND(AVG(RateVon), 3) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
				
			// }
		
			if (theme === "Von") return  `SELECT Jahr as label, sum(Wert) as result FROM matrices where Von = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			if (theme === "Nach") return `SELECT Jahr as label, sum(Wert) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
				}
		if (type === "location")
		{
			if((this.props.dataProcessing === 'wanderungsrate') || (this.props.dataProcessing === 'ratevon') || (this.props.dataProcessing === 'ratenach')) {
				if (theme === "Von")
				return `SELECT Nach as label, ROUND(AVG(RateVon), 3) as result FROM matrices WHERE Von = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			if (theme === "Nach")
			return `SELECT Von as label, ROUND(AVG(RateNach), 3) as result FROM matrices WHERE Nach = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
		}
		// if (this.props.dataProcessing === 'ratevon'){
		// 	if (theme === "Von")
		// 	return `SELECT Nach as label, ROUND(AVG(RateVon), 3) as result FROM matrices WHERE Von = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
		// if (theme === "Nach")
		// return `SELECT Von as label, ROUND(AVG(RateNach), 3) as result FROM matrices WHERE Nach = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
		// 		// if (theme === "Nach") return `SELECT Jahr as label, ROUND(AVG(RateNach), 3) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
		// } 
		// if (this.props.dataProcessing === 'ratenach') {
		// 	if (theme === "Von")
		// 	return `SELECT Nach as label, ROUND(AVG(RateNach), 3) as result FROM matrices WHERE Von = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
		// if (theme === "Nach")
		// return `SELECT Von as label, ROUND(AVG(RateVon), 3) as result FROM matrices WHERE Nach = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
		// 		// if (theme === "Nach") return `SELECT Jahr as label, ROUND(AVG(RateVon), 3) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
		
		// }

		if (theme === "Von")
		return `SELECT Nach as label, MYSUM(Wert) as result FROM matrices WHERE Von = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;

		if (theme === "Nach")
		return `SELECT Von as label, MYSUM(Wert) as result FROM matrices WHERE Nach = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;

		}
		return null;
	}

	private queryIndex(): any[]
	{
		if ((this.props.location == null) || (this.props.yearsAvailable.length == 0))
		{
			return [];
		}
		if (this.props.theme === 'Saldi')
		{
			const migrationsInsideClause = (this.props.migrationsInside) ? `` : ` AND Von <> Nach `;

			let query_zuzug = this.constructQuery(this.state.type, 'Nach');
			let results_zuzug = this.props.db(query_zuzug);
			let query_wegzug = this.constructQuery(this.state.type, 'Von');
			let results_wegzug = this.props.db(query_wegzug);
		
			const years = this.props.yearsSelected;
			const stringYears = R.join(
				', ',
				R.map((year) => `'${year}'`, years)
			);
			const populationqueryArea = `SELECT  MYSUM(Wert) as population FROM population WHERE Area = '${this.props.location}' AND Jahr IN (${stringYears}) GROUP BY Area`;
			const populationResults = this.props.db(populationqueryArea);
			const populationqueryYear = `SELECT Jahr as label, MYSUM(Wert) as population FROM population WHERE Area = '${this.props.location}' AND Jahr IN (${stringYears}) GROUP BY Jahr`;
			const populationResultsYear = this.props.db(populationqueryYear);

			const query_zuzug_wert_year =   `SELECT Jahr as label, sum(Wert) as result FROM matrices where Nach = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			const results_zuzug_wert_year = this.props.db(query_zuzug_wert_year);
			const query_wegzug_wert_year =   `SELECT Jahr as label, sum(Wert) as result FROM matrices where Von = '${this.props.location}'  ${migrationsInsideClause} AND Von <> Nach GROUP BY Jahr`;
			const results_wegzug_wert_year = this.props.db(query_wegzug_wert_year);

			const query_zuzug_wert_location =   `SELECT Von as label, MYSUM(Wert) as result FROM matrices WHERE Nach = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Von ORDER BY Von`;
			const results_zuzug_wert_location = this.props.db(query_zuzug_wert_location);
			const query_wegzug_wert_location =   `SELECT Nach as label, MYSUM(Wert) as result FROM matrices WHERE Von = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideClause} GROUP BY Nach ORDER BY Nach`;
			const results_wegzug_wert_location = this.props.db(query_wegzug_wert_location);

			let results_zuzug_Filtered : any[] = [];
			let results_wegzug_Filtered : any[] = [];
			let results_zuzug_wert_Filtered : any[] = [];
			let results_wegzug_wert_Filtered : any[] = [];
			if(this.state.type === 'year'){
				for(let item of results_zuzug ){
					if ( R.contains(item.label, stringYears)){
						results_zuzug_Filtered.push(item);
					}
				}
				for(let item of results_wegzug ){
					if ( R.contains(item.label, stringYears)){
						results_wegzug_Filtered.push(item);
					}
				}
				for(let item of results_zuzug_wert_year ){
					if ( R.contains(item.label, stringYears)){
						results_zuzug_wert_Filtered.push(item);
					}
				}
				for(let item of results_wegzug_wert_year ){
					if ( R.contains(item.label, stringYears)){
						results_wegzug_wert_Filtered.push(item);
					}
				}
			}
			let saldiValue = this.calculateSaldiForYears(this.state.type === 'year' ? results_zuzug_Filtered : results_zuzug, this.state.type === 'year' ? results_wegzug_Filtered : results_wegzug);
			let saldiValueRate = this.calculateSaldiRate(this.state.type === 'year' ? populationResultsYear : populationResults, this.state.type === 'year' ? results_zuzug_wert_Filtered : results_zuzug_wert_location, this.state.type === 'year' ? results_wegzug_wert_Filtered : results_wegzug_wert_location);			
			return this.calculateIndexValue( this.props.dataProcessing === 'wanderungsrate' ? saldiValueRate : saldiValue);
			// return this.calculateIndexValue(this.props.dataProcessing === 'ratevon' || this.props.dataProcessing === 'ratenach' ? saldiValueRate : saldiValue);
			// return this.calculateIndexValue(this.calculateSaldiForYears(this.state.type === 'year' ? results_zuzug_Filtered : results_zuzug, this.state.type === 'year' ? results_wegzug_Filtered : results_wegzug));
		}
		let query = this.constructQuery(this.state.type, this.props.theme);
		let results = this.props.db(query);
		// selectable years from the left panel
		let resultsFiltered : any[] = [];
		const years = this.props.yearsSelected;
		const stringYears = R.join(
			', ',
			R.map((year) => `'${year}'`, years)
		);
		if(this.state.type === 'year'){
			for(let item of results ){
				if ( R.contains(item.label, stringYears)){
					resultsFiltered.push(item);
				}
			}
		}
		return this.state.type === 'year' ? this.calculateIndexValue(resultsFiltered):this.calculateIndexValue(results);
	}

	private calculateSaldiRate(pop_data: any[],results_zuzug_wert: any[], results_wegzug_wert: any[] ): any[]
	{
		let results = [];
		let resultsRate = [];
		for (let zuzug of results_zuzug_wert)
		{
			for (let wegzug of results_wegzug_wert)
			{
				if (zuzug.label === wegzug.label )
				{
					let saldo = 
					zuzug.result === NaN && wegzug.result !== undefined || zuzug.result === undefined && wegzug.result !== NaN  ? 0 -  wegzug.result :
					zuzug.result !== NaN && wegzug.result === undefined || zuzug.result !== undefined && wegzug.result === NaN  ? zuzug.result - 0 : 
					zuzug.result === NaN && wegzug.result === NaN ? NaN : zuzug.result - wegzug.result;
					results.push({
						'label': zuzug.label,
						'result': saldo,
					});
				}
					
			}
		}
		if (this.state.type === "year")
		{
			if (this.props.dataProcessing === "wanderungsrate")
			{
				for (let result of results)
				{
					for (let pop of pop_data)
					{
						if(result.label === pop.label )
						{
							let saldo_rate = result.result * 1000 / pop.population;
							resultsRate.push({
							'label': result.label,
							'result': this.roundValueThree(saldo_rate),
							});
						}
					}
				}
				
			}
		}
		if (this.state.type === "location") 
		{
			for (let result of results)
				{
					let saldo_rate = result.result * 1000 / pop_data[0].population;
					resultsRate.push({
						'label': result.label,
						'result': this.roundValueThree(saldo_rate),
					});
				}
		}
		return resultsRate;
	}

	private roundValueThree(num: number): number {
		return parseFloat(num.toFixed(3));
	}

	private calculateSaldiForYears(results_zuzug: any[], results_wegzug: any[]): any[]
	{
		let results = [];
		
		for (let zuzug of results_zuzug)
		{
			for (let wegzug of results_wegzug)
			{
				if (zuzug.label === wegzug.label)
				{
					

					let saldo = 
					zuzug.result === NaN && wegzug.result !== undefined || zuzug.result === undefined && wegzug.result !== NaN  ? 0 -  wegzug.result :
					 zuzug.result !== NaN && wegzug.result === undefined || zuzug.result !== undefined && wegzug.result === NaN  ? zuzug.result - 0 : 
					 zuzug.result === NaN && wegzug.result === NaN ? NaN : zuzug.result - wegzug.result;
					results.push({
						'label': zuzug.label,
						'result': saldo,
					});
				}
			}
		}
		return results;
	}

	private calculateIndexValue(results: any[]): any[]
	{
		let reference = this.getReferenceValue(results);
		Log.debug("reference: ", reference);
		for (let item of results)
		{
			let value = item.result;
			if (reference == 0) item.index = value;
			if ((reference > 0) && (value >= 0)) item.index = 1 + (value - reference) / reference;
			if ((reference > 0) && (value < 0)) item.index = 1 + (value - reference) / reference;
			if ((reference < 0) && (value < 0)) item.index = 1 + (reference - value) / reference;
			if ((reference < 0) && (value > 0)) item.index = 1 + (reference - value) / reference;
			if ((reference < 0) && (value = 0)) item.index = 1 - (reference - value) / reference;
		}

		return results;
	}

	private getReferenceValue(results: any[]): number
	{
		let reference = 0;
		let label = "";
		if (this.state.type === "year") label = this.state.referenceYear;
		if (this.state.type === "location") label = this.state.referenceLocation;
		for (let item of results)
		{
			if (item.label === label) reference = item.result;
		}
		return reference;
	}

	private setType(event: { originalEvent: Event, value: any})
	{
		this.setState({ type: event.value });
	}

	private getType()
	{
		for (let type of this.types)
		{
			if (type.value === this.state.type) return type.value;
		}
		return this.types[0].value;
	}

	private setYear(event: { originalEvent: Event, value: any})
	{
		console.log(event);
		this.setState({ referenceYear: event.value });
	}

	private setLocation(event: { originalEvent: Event, value: any})
	{
		console.log(event);
		this.setState({ referenceLocation: event.value });
	}

	private getYearsSelected(): string {
		 const years = this.props.yearsSelected;
		const stringYears = R.join(
			', ',
			R.map((year) => `'${year}'`, years)
		);
		return stringYears;
	}

}
export default withNamespaces()(D3IndexView);
