import React from "react";
import R from "ramda";

// Does not work in electronjs, so we use the @ts-ignore annotation
// For development (hint types, autocompletion) uncomment this 2 lines below
// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';

export interface IStatisticsItem
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface IStatisticsViewProps
{
	items: IStatisticsItem[];
}

export default class StatisticsView extends React.Component<IStatisticsViewProps>
{

	constructor(props: IStatisticsViewProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		let count: number = this.props.items.length;
		let mean: number = this.calculateMean(count);
		let variance: number = this.calculateVariance(mean, count);
		let median: number = this.calculateMedian(count);
		return (
			<div>
				<table className="bp3-html-table .bp3-small .bp3-html-table-bordered .bp3-html-table-condensed">
					<tbody>
						<tr>
							<th align="right">Mittelwert:</th>
							<td>{mean}</td>
						</tr>
						<tr>
							<th align="right">Median:</th>
							<td>{median}</td>
						</tr>
						<tr>
							<th align="right">Varianz:</th>
							<td>{variance}</td>
						</tr>
						<tr>
							<th align="right">Standardabweichung:</th>
							<td>{Math.sqrt(variance)}</td>
						</tr>
					</tbody>
				</table>
			</div>
		)
	}

	private calculateMean(count: number): number
	{
		let sum: number = 0;
		for (let item of this.props.items)
		{
			sum += item.Wert;
		}
		return sum/count;
	}

	private calculateMedian(count: number): number
	{
		if (count == 0) return 0;
		let index = (count - 1) / 2;
		let values: IStatisticsItem[] = R.sortBy(R.prop("Wert"), this.props.items);
		let lower: number = values[Math.floor(index)].Wert;
		let higher: number = values[Math.ceil(index)].Wert;
		return (lower+higher)/2;
	}

	private calculateVariance(mean: number, count: number): number
	{
		let sum: number = 0;
		for (let item of this.props.items)
		{
			let diff: number = item.Wert - mean;
			sum += diff * diff;
		}
		return sum/count;
	}

}
