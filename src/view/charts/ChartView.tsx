import {Slider} from "primereact/slider";

import R from "ramda";
import React from "react";

// Does not work in electronjs, so we use the @ts-ignore annotation
// For development (hint types, autocompletion) uncomment this 2 lines below
// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';

export interface IChartItem
{
	[name: string]: number;
}

export interface IChartViewProps
{
	data: IChartItem[];
	type: string;
}

interface IChartViewState
{
	threshold: number;
}

export class ChartView extends React.Component<IChartViewProps, IChartViewState>
{

	public static getTypes(): string[]
	{
		return ["Chord", "Sankey"];
	}

	private static idCounter: number = 0;
	// @ts-ignore
	private chart: am4charts.Chart | null;
	private id: number;

	constructor(props: IChartViewProps)
	{
		super(props);
		this.chart = null;
		ChartView.idCounter++;
		this.id = ChartView.idCounter;
		this.state =
		{
			threshold: 0,
		};
	}

	public componentDidMount()
	{
		this.chart = this.createChart();
	}

	public componentDidUpdate()
	{
		if (this.chart)
		{
			this.chart.dispose();
		}
		this.chart = this.createChart();
	}

	public componentWillUnmount()
	{
		if (this.chart)
		{
			this.chart.dispose();
		}
	}

	public render(): JSX.Element
	{
		const [min, max] = this.getMinMax();
		return (
			<div className="p-grid">
				<div className="p-col-1">{min}</div>
				<div className="p-col-10">
					<Slider min={min} max={max} value={this.state.threshold} orientation="horizontal" onChange={(e) => this.setState({ threshold: e.value as number})}/>
				</div>
				<div className="p-col-1">{max}</div>
				<div className="p-col-12 p-justify-center">Anzeige ab Wert: {this.state.threshold}</div>
				<div className="p-col-12" id={"chart-" + this.id} style={{ width: "100%", height: "800px" }}></div>
			</div>
		);
	}

	private createChart()
	{
		// @ts-ignore
		let chart = null;
		if (this.props.type === "Sankey")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.SankeyDiagram);
		}
		else if (this.props.type === "Chord")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.ChordDiagram);
		}
		else
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.SankeyDiagram);
		}
		const linkTemplate = chart.links.template;
		let normalizedData = R.filter((item) => item.Wert >= this.state.threshold, this.props.data);
		if ( this.props.type === "Sankey")
		{
			normalizedData = R.reject((item) => item.Von === item.Nach, normalizedData);
		}
		chart.data = normalizedData;
		chart.dataFields.fromName = "Von";
		chart.dataFields.toName = "Nach";
		chart.dataFields.value = "Wert";
		return chart;
	}

	private getMinMax(): [number, number]
	{
		let max = 0;
		let min = 0;
		if (this.props.data)
		{
			max = R.reduce((acc, item) => R.max(acc, item.Wert), Number.MIN_VALUE, this.props.data);
			min = R.reduce((acc, item) => R.min(acc, item.Wert), Number.MAX_VALUE, this.props.data);
		}
		return [min, max];
	}

}
