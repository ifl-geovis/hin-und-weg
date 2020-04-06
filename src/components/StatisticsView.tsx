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
	theme: string;
}

export default class StatisticsView extends React.Component<IStatisticsViewProps>
{

	constructor(props: IStatisticsViewProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		let maximum: number;
		let minimum: number;
		let count: number = this.props.items.length;
		let mean: number = this.calculateMean(count);
		let variance: number = this.calculateVariance(mean, count);
		let median: number = this.calculateMedian(count);
		if(this.props.theme == "Von")
		{
			console.log("in Von IF");
			maximum = 0;
			minimum = this.calculateMaximum(count);
		}else if(this.props.theme == "Nach"){
			console.log("in Nach IF");
			maximum = this.calculateMaximum(count);
			minimum = 0;
		}else{
			console.log("in Else IF");
			maximum = this.calculateMaximum(count);
			minimum = Math.abs(this.calculateMinimum(count));
		}


		let mode: number = this.determineMode();
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
							<th align="right">Hinzugezogen Maximal:</th>
							<td>{maximum}</td>
						</tr>
						<tr>
							<th align="right">Weggezogen Maximal:</th>
							<td>{minimum}</td>
						</tr>
						<tr>
							<th align="right">Varianz:</th>
							<td>{variance}</td>
						</tr>
						<tr>
							<th align="right">Standardabweichung:</th>
							<td>{Math.sqrt(variance)}</td>
						</tr>
						<tr>
							<th align="right">Modus:</th>
							<td>{mode}</td>
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

	private calculateMaximum(count: number): number
	{ 
		let maxwert = 0;
		for (let item of this.props.items)
		{
			if(item.Wert > maxwert)
			maxwert = item.Wert;
		}
		return maxwert;
	}

	private calculateMinimum(count: number): number
	{
		let minwert = 500;
		for (let item of this.props.items)
		{
			if(item.Wert < minwert)
			minwert = item.Wert;
		}
		return minwert;
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

	private determineMode(): number
	{
		let count: number = 0;
		let mode: number = 0;
		let current: number = 0;
		let currentcount: number = 0;
		let values: IStatisticsItem[] = R.sortBy(R.prop("Wert"), this.props.items);
		for (let item of values)
		{
			if (item.Wert == current)
			{
				currentcount += 1;
			}
			else
			{
				if (currentcount > count)
				{
					count = currentcount;
					mode = current;
				}
				current = item.Wert;
				currentcount = 1;
			}
		}
		if (currentcount > count)
		{
			count = currentcount;
			mode = current;
		}
		return mode;
	}

}
