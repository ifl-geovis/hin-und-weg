import React from "react";
import R from "ramda";
import D3HistogramView from '../charts/D3HistogramView';

import BaseData from "../../data/BaseData";
import Log from '../../log';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

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
	MeanZuzüge: number;
	MeanWegzüge: number;
	MedianZuzüge: number;
	MedianWegzüge: number;
	min: number;
	max: number;
}

export interface IStatisticsViewProps extends WithNamespaces
{
	basedata: BaseData;
	items: IStatisticsItem[];
	location: string | null;
	theme: string;
	yearsSelected: string[];
	statisticPerYearAusgabe: IStatisticPerYearAusgabe[];
	vizID: number;
	baseViewId: number;
}

// export default
class StatisticsView extends React.Component<IStatisticsViewProps>
{

	constructor(props: IStatisticsViewProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		Log.debug("render input", this.props.items);
		let maxzuzüge: string;
		let maxwegzüge: string;
		let count: number = this.props.items.length;
		let mean: number = this.calculateMean(count);
		let variance: number = this.calculateVariance(mean, count);
		let stddev: number = this.calculateStandardDeviation(mean, count);
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
		let title_text = t('statistics.title1');
		let themeLabel = this.props.theme === "Von" ? t('themes.from') : this.props.theme === "Nach" ? t('themes.to') : this.props.theme === "Saldi" ? t('themes.saldi') : "";
		// let title_text = "Statistik für";
		if (this.props.theme) title_text += " " + themeLabel;
		// if (this.props.theme) title_text += " " + this.props.theme;
		if (this.props.location) title_text += " " + this.props.location;
		if (this.props.yearsSelected) {
			title_text += t('statistics.title2');
			// title_text += " in den Jahren ";
			let first: boolean = true;
			for (let year of this.props.yearsSelected) {
				if (!first) title_text += ", ";
				title_text += year;
				first = false;
			}
		}
		const years = this.getYears();
		return (
			<div className="p-grid">
				<div className="p-col-12">
				<h3>{title_text}</h3> <hr/>
				</div>
				<table className="p-col-4">
					<tbody>
						<tr>
							<th align="right">{t('statistics.mean')}:</th>
							{/* <th align="right">Mittelwert:</th> */}
							<td>{this.standardizeOutput(mean)}</td>
						</tr>
						<tr>
							<th align="right">{t('statistics.median')}:</th>
							{/* <th align="right">Median:</th> */}
							<td>{this.standardizeOutput(median)}</td>
						</tr>
						<tr>
							<th align="right">{t('statistics.maxIncoming')}</th>
							{/* <th align="right">Hinzugezogen Maximal:</th> */}
							<td>{maxzuzüge}</td>
						</tr>
						<tr>
							<th align="right">{t('statistics.maxOutgoing')}</th>
							{/* <th align="right">Weggezogen Maximal:</th> */}
							<td>{maxwegzüge}</td>
						</tr>
						<tr>
							<th align="right">{t('statistics.variance')}</th>
							{/* <th align="right">Varianz:</th> */}
							<td>{this.standardizeOutput(variance)}</td>
						</tr>
						<tr>
							<th align="right">{t('statistics.stdeviation')}</th>
							{/* <th align="right">Standardabweichung:</th> */}
							<td>{this.standardizeOutput(stddev)}</td>
						</tr>
						<tr>
							<th align="right">{t('statistics.mode')}</th>
							{/* <th align="right">Modus:</th> */}
							<td>{this.standardizeOutput(mode)}</td>
						</tr>
					</tbody>
				</table>
				<div className="p-col-8">
				<D3HistogramView basedata={this.props.basedata} baseViewId={this.props.baseViewId} vizID={this.props.vizID} theme={this.props.theme} yearsSelected={this.props.yearsSelected} />
				</div>

				<br></br>
				<br></br>

				<div className="scrollable p-col-12">
					<table className="year-statistics">
						<tbody>
							<tr>
								<th rowSpan={2}>{t('statistics.year')}</th>
								{/* <th rowSpan={2}>Jahr</th> */}
								<th colSpan={3}>{t('statistics.mean')}</th>
								{/* <th colSpan={3}>Mittelwert</th> */}
								<th colSpan={2}>{t('statistics.median')}</th>
								{/* <th colSpan={2}>Median</th> */}
								<th colSpan={2}>{t('statistics.most')}</th>
								{/* <th colSpan={2}>Meiste</th> */}
							</tr>
							<tr>
								<th>{t('statistics.saldi')}</th>
								{/* <th>Saldi</th> */}
								<th>{t('statistics.incoming')}</th>
								{/* <th>Zuzüge</th> */}
								<th>{t('statistics.outgoing')}</th>
								{/* <th>Wegzüge</th> */}
								<th>{t('statistics.incoming')}</th>
								{/* <th>Zuzüge</th> */}
								<th>{t('statistics.outgoing')}</th>
								{/* <th>Wegzüge</th> */}
								<th>{t('statistics.incoming')}</th>
								{/* <th>Zuzüge</th> */}
								<th>{t('statistics.outgoing')}</th>
								{/* <th>Wegzüge</th> */}
							</tr>

							{years}

						</tbody>
					</table>
				</div>

			</div>
		)
	}

	private standardizeOutput(value: number): string
	{
		if (typeof value != 'number') return "" + value;
		if (Number.isInteger(value)) return "" + value;
		if (i18n.language == "en") return value.toFixed(3);
		return value.toFixed(3).replace("\.", ",");
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
		const {t}:any = this.props ;
		let maxwert = 0;
		let ort = "";
		for (let item of this.props.items)
		{
			if(item.Wert > maxwert){
				maxwert = item.Wert;
				if(this.props.theme == "Von"){
					ort = t('statistics.to') + item.Nach;
					// ort = " nach " + item.Nach;
				}else{
					ort = t('statistics.from') + item.Von;
					// ort = " von " + item.Von;
				}
			}
		}
		return this.standardizeOutput(Math.abs(maxwert)) +  ort;
	}

	private calculateMinimum(count: number): string
	{
		const {t}:any = this.props ;
		let minwert = 5000;
		let ort = "";
		for (let item of this.props.items)
		{
			if(item.Wert < minwert)
			{
				minwert = item.Wert;
				if(item.Von != undefined)
				ort = t('statistics.to') + item.Von;
				// ort = " nach " + item.Von;
			}
		}
		return this.standardizeOutput(Math.abs(minwert)) + ort;
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

	private calculateStandardDeviation(mean: number, count: number): number
	{
		return Math.sqrt(this.calculateVariance(mean, count));
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
				<tr key={"row_" + row.Jahr}>
					<th>{row.Jahr}</th>
					<td>{this.standardizeOutput(row.Mean)}</td>
					<td>{this.standardizeOutput(row.MeanZuzüge)}</td>
					<td>{this.standardizeOutput(row.MeanWegzüge)}</td>
					<td>{this.standardizeOutput(row.MedianZuzüge)}</td>
					<td>{this.standardizeOutput(row.MedianWegzüge)}</td>
					<td>{this.standardizeOutput(row.max)}</td>
					<td>{this.standardizeOutput(row.min)}</td>
				</tr>
		);
	}

}
export default withNamespaces()(StatisticsView);
