import * as React from "react";
import { Dropdown } from "primereact/dropdown";

import Config from "../../config";
import Log from '../../log';

export interface IIndexViewProps {
	db: alaSQLSpace.AlaSQL;
	location: string | null;
	theme: string;
	yearsAvailable: string[];
}

interface IIndexViewState {
	indexValue: number;
	type: string;
}

export default class IndexView extends React.Component<IIndexViewProps, IIndexViewState>
{

	private types = [
		{label: "das Jahr", value: "year"},
		{label: "die Region", value: "location"},
	];

	constructor(props: IIndexViewProps)
	{
		super(props);
		this.state =
		{
			indexValue: 0,
			type: 'year',
		};
		this.setType = this.setType.bind(this);
	}

	public render(): JSX.Element
	{
		let data = this.queryIndex();
		console.log(data);
		console.log(this.state.type);
		return (
			<div>
				<h3>Indexwerte</h3>
				Indexwerte bezogen auf&nbsp;
				<Dropdown optionLabel="label" value={this.getType()} options={this.types} onChange={this.setType} />
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
		let reference = 100;
		if (this.props.theme === 'Saldi')
		{
			let query_zuzug = this.constructQuery(this.state.type, 'Nach');
			let results_zuzug = this.props.db(query_zuzug);
			let query_wegzug = this.constructQuery(this.state.type, 'Von');
			let results_wegzug = this.props.db(query_wegzug);
			return this.calculateIndexValue(reference, this.calculateSaldiForYears(results_zuzug, results_wegzug));
		}
		let query = this.constructQuery(this.state.type, this.props.theme);
		let results = this.props.db(query);
		return this.calculateIndexValue(reference, results);
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

	private calculateIndexValue(reference: number, results: any[]): any[]
	{
		for (let item of results)
		{
			let value = item.result;
			if ((reference > 0) && (value > 0)) item.index = value / reference;
			if ((reference > 0) && (value < 0)) item.index = -1 * (reference - value) / reference;
			if ((reference < 0) && (value < 0)) item.index = (reference - value) / reference;
			if ((reference < 0) && (value > 0)) item.index = (reference - value) / reference;
		}
		return results;
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

}