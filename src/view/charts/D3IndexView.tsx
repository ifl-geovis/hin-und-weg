import * as React from "react";
import R from 'ramda';

import { Dropdown } from "primereact/dropdown";
import * as d3 from 'd3';

import { D3IndexValuesChart} from "./D3IndexValuesChart";
import ContainerDimensions from 'react-container-dimensions';

import Log from '../../log';



export interface ID3IndexViewProps {
	db: alaSQLSpace.AlaSQL;
	location: string | null;
	theme: string;
	yearsAvailable: string[];
	locations: string[];
	vizID: number;
	baseViewId: number;
	yearsSelected: string[];
	migrationsInside: boolean;
}

interface ID3IndexViewState {
	indexValue: number;
	type: string;
	referenceYear: string;
	referenceLocation: string;
}

export default class D3IndexView extends React.Component<ID3IndexViewProps, ID3IndexViewState>
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
		let data = this.queryIndex();
	
		Log.debug("index value data: ", data);
		let selector = null;
		if (this.state.type === "year") selector = this.createYearSelector();
		else if (this.state.type === "location") selector = this.createRegionSelector();
		else selector = this.createYearSelector();
		let view = this.createView(data);
		let refText : string = this.state.type === "location" ? this.state.referenceLocation : " Jahr " + this.state.referenceYear;
		let themeTitel = this.props.theme === "Von" ? "Wegzüge aus" : this.props.theme === "Nach" ? "Zuzüge nach" : this.props.theme === "Saldi" ? "Saldi für" : "";
		return (
			<div>
				<h3>{themeTitel}  {this.props.location}, Indexwert: {refText} (=100%) </h3>
				Auswahl Indexwert:
				&nbsp;
				<Dropdown optionLabel="label" value={this.getType()} options={this.types} onChange={this.setType} />
				&nbsp;
				{selector}
				&nbsp;
				<hr />
				{view}
			</div>
		);
	}



	private createYearSelector() {
		const options = this.props.yearsAvailable.map((option: string) => {
			return { value: option, label: option};
		});
		
		const selected = { value: this.state.referenceYear, label: this.state.referenceYear};
		return (
			<Dropdown optionLabel="label" value={selected} options={options} onChange={this.setYear} />
		);
	}

	private createRegionSelector() {
		const options = this.props.locations.map((option: string) => {
			return { value: option, label: option};
		});
		const selectzedLocation = this.props.location;
		console.log("selected location: " + selectzedLocation);
		const optionsFiltered = options.filter(function(item) {
			return item.label !== selectzedLocation
		})
		const selected = { value: this.state.referenceLocation, label: this.state.referenceLocation};
		return (
			<Dropdown optionLabel="label" value={selected} options={optionsFiltered} onChange={this.setLocation} style={{ width: "15em" }} />
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
		const migrationsInsideOff = ` AND Von <> Nach `;
		Log.debug("stringYears in constructQuery : ", stringYears);
		if (type === "year")
		{
			if (theme === "Von") return  `SELECT Jahr as label, sum(Wert) as result FROM matrices where Von = '${this.props.location}' ${migrationsInsideClause} GROUP BY Jahr`;
			if (theme === "Nach") return `SELECT Jahr as label, sum(Wert) as result FROM matrices where Nach = '${this.props.location}' ${migrationsInsideClause} GROUP BY Jahr`;
		}
		if (type === "location")
		{
			if (theme === "Von") 
			return `SELECT Nach as label, MYSUM(Wert) as result FROM matrices WHERE Von = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideOff} GROUP BY Nach ORDER BY Nach`;
			if (theme === "Nach")
			return `SELECT Von as label, MYSUM(Wert) as result FROM matrices WHERE Nach = '${this.props.location}' AND Jahr IN (${stringYears}) ${migrationsInsideOff} GROUP BY Von ORDER BY Von`;
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
			let query_zuzug = this.constructQuery(this.state.type, 'Nach');
			let results_zuzug = this.props.db(query_zuzug);
			let query_wegzug = this.constructQuery(this.state.type, 'Von');

			let results_wegzug = this.props.db(query_wegzug);
			Log.debug("results_wegzug in queryIndex : ", results_wegzug);

			return this.calculateIndexValue(this.calculateSaldiForYears(results_zuzug, results_wegzug));
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
		Log.debug("results in queryIndex : ", results);

		
		//return this.calculateIndexValue(results);
		return this.state.type === 'year' ? this.calculateIndexValue(resultsFiltered):this.calculateIndexValue(results);

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
					let saldo = zuzug.result - wegzug.result;
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
			if ((reference < 0) && (value >= 0)) item.index = 1 + (reference - value) / reference;
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
		this.setState({ type: event.value.value });
	}
	

	private getType()
	{
		for (let type of this.types)
		{
			if (type.value === this.state.type) return type;
		}
		return this.types[0];
	}

	private setYear(event: { originalEvent: Event, value: any})
	{
		console.log(event);
		this.setState({ referenceYear: event.value.value });
	}

	private setLocation(event: { originalEvent: Event, value: any})
	{
		console.log(event);
		this.setState({ referenceLocation: event.value.value });
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