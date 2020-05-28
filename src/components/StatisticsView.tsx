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

export interface IStatisticPerYearAusgabe
{
	Jahr: number;
	Mean: number;
	Median: number;
	min: number;
	max: number;
}

export interface IStatisticsViewProps
{
	items: IStatisticsItem[];
	theme: string;
	statisticPerYearAusgabe: IStatisticPerYearAusgabe[];
}

export default class StatisticsView extends React.Component<IStatisticsViewProps>
{

	constructor(props: IStatisticsViewProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		let maxzuzüge: string;
		let maxwegzüge: string;
		let count: number = this.props.items.length;
		let mean: number = this.calculateMean(count);
		let variance: number = this.calculateVariance(mean, count);
		let median: number = this.calculateMedian(count);
		if(this.props.theme == "Von")
		{
			maxzuzüge = "0";
			maxwegzüge = this.calculateMaximum(count);
		}else if(this.props.theme == "Nach"){
			maxzuzüge = this.calculateMaximum(count);
			maxwegzüge = "0";
		}else{
			maxzuzüge = this.calculateMaximum(count);
			maxwegzüge = this.calculateMinimum(count);
		}
		let mode: number = this.determineMode();
		const years = this.getYears();
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
							<td>{maxzuzüge}</td>
						</tr>
						<tr>
							<th align="right">Weggezogen Maximal:</th>
							<td>{maxwegzüge}</td>
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

				<br></br>
				<br></br>
				<br></br>

				<table className="bp3-html-table .bp3-small .bp3-html-table-bordered .bp3-html-table-condensed">
					<tbody>

					<thead>Saldistatistik pro Jahr</thead>

						<tr>
							<th>Year</th>
							<th>Mittelwert</th>
							<th>Median</th>
							<th>Meiste Wegzüge</th>
							<th>Meiste Zuzüge</th>
						</tr>

						{years}

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

	private calculateMaximum(count: number): string
	{
		let maxwert = 0;
		let ort = "";
		for (let item of this.props.items)
		{
			if(item.Wert > maxwert){
				maxwert = item.Wert;
				if(this.props.theme == "Von"){
					ort = " nach " + item.Nach;
				}else{
					ort = " von " + item.Von;
				}
			}
		}
		return Math.abs(maxwert).toString() +  ort;
	}

	private calculateMinimum(count: number): string
	{
		let minwert = 5000;
		let ort = "";
		for (let item of this.props.items)
		{
			if(item.Wert < minwert)
			{
				minwert = item.Wert;
				ort = " nach " + item.Von;
			}
		}
		return Math.abs(minwert).toString() + ort;
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

	private getYears()
	{
		let years = [];

		for (let row of this.props.statisticPerYearAusgabe)
		{
			years.push(this.getYear(row));

		}
		return years;
	}

	private getYear(row: IStatisticPerYearAusgabe): JSX.Element
	{
		return (
				<tr>
					<th>{row.Jahr}</th>
					<td>{row.Mean}</td>
					<td>{row.Median}</td>
					<td>{row.max}</td>
					<td>{row.min}</td>
				</tr>
		);
	}

}
