import * as React from "react";
import { Dropdown } from "primereact/dropdown";

import Config from "../../config";
import Log from '../../log';

export interface IIndexViewProps {
	db: alaSQLSpace.AlaSQL;
	location: string | null;
	theme: string;
	yearsAvailable: string[];
	locations: string[];
}

interface IIndexViewState {
	indexValue: number;
	type: string;
	referenceYear: string;
	referenceLocation: string;
	view: string;
}

export default class IndexView extends React.Component<IIndexViewProps, IIndexViewState>
{

	private types = [
		{label: "das Jahr", value: "year"},
		{label: "die Region", value: "location"},
	];

	private views = [
		{label: "Tabelle", value: "table"},
		{label: "Diagramm", value: "chart"},
	];

	constructor(props: IIndexViewProps)
	{
		super(props);
		this.state =
		{
			indexValue: 0,
			type: 'year',
			referenceYear: this.props.yearsAvailable[0],
			referenceLocation: this.props.locations[0],
			view: "table",
		};
		this.setType = this.setType.bind(this);
		this.setYear = this.setYear.bind(this);
		this.setLocation = this.setLocation.bind(this);
		this.setView = this.setView.bind(this);
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
		return (
			<div>
				<h3>Indexwerte</h3>
				Die Indexwerte bezogen auf
				&nbsp;
				<Dropdown optionLabel="label" value={this.getType()} options={this.types} onChange={this.setType} />
				&nbsp;
				{selector}
				werden als
				&nbsp;
				<Dropdown optionLabel="label" value={this.getView()} options={this.views} onChange={this.setView} />
				&nbsp;
				angezeigt.
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
		const selected = { value: this.state.referenceLocation, label: this.state.referenceLocation};
		return (
			<Dropdown optionLabel="label" value={selected} options={options} onChange={this.setLocation} style={{ width: "15em" }} />
		);
	}

	private createView(data: any[])
	{
		if (this.state.view === "table") return this.createTableView(data);
		if (this.state.view === "chart") return this.createChartView(data);
		return this.createTableView(data);
	}

	private createTableView(data: any[])
	{
		let rows = [];
		for (let item of data)
		{
			rows.push(this.createTableRow(item));
		}
		let label = "Beschriftung";
		if (this.state.type === "year") label = "Jahr";
		if (this.state.type === "location") label = "Region";
		return (
			<table className="indexvalues">
				<thead>
					<tr>
						<th>{label}</th>
						<th>Wert</th>
						<th>Indexwert</th>
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
		);
	}

	private createTableRow(item: any)
	{
		let indexvalue = item.index.toFixed(3);
		let selected = "standard";
		if ((item.label === this.state.referenceYear) || (item.label === this.state.referenceLocation)) selected = "selected";
		return (
			<tr key={item.label} className={selected}>
				<th>{item.label}</th>
				<td>{item.result}</td>
				<td>{indexvalue}</td>
			</tr>
		);
	}

	private createChartView(data: any[])
	{
		return (
			<div>
				To be done!
			</div>
		);
	}

	private constructQuery(type: string, theme: string)
	{
		if (type === "year")
		{
			if (theme === "Von") return "SELECT Jahr as label, sum(Wert) as result FROM matrices where Von = '" + this.props.location + "' AND Von <> Nach GROUP BY Jahr";
			if (theme === "Nach") return "SELECT Jahr as label, sum(Wert) as result FROM matrices where Nach = '" + this.props.location + "' AND Von <> Nach GROUP BY Jahr";
		}
		if (type === "location")
		{
			if (theme === "Von") return "SELECT Nach as label, sum(Wert) as result FROM matrices where Von = '" + this.props.location + "' GROUP BY Nach";
			if (theme === "Nach") return "SELECT Von as label, sum(Wert) as result FROM matrices where Nach = '" + this.props.location + "' GROUP BY Von";
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
			return this.calculateIndexValue(this.calculateSaldiForYears(results_zuzug, results_wegzug));
		}
		let query = this.constructQuery(this.state.type, this.props.theme);
		let results = this.props.db(query);
		return this.calculateIndexValue(results);
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
			if ((reference > 0) && (value >= 0)) item.index = value / reference;
			if ((reference > 0) && (value < 0)) item.index = -1 * (reference - value) / reference;
			if ((reference < 0) && (value < 0)) item.index = (reference - value) / reference;
			if ((reference < 0) && (value >= 0)) item.index = (reference - value) / reference;
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

	private setView(event: { originalEvent: Event, value: any})
	{
		this.setState({ view: event.value.value });
	}

	private getView()
	{
		for (let view of this.views)
		{
			if (view.value === this.state.view) return view;
		}
		return this.views[0];
	}

}