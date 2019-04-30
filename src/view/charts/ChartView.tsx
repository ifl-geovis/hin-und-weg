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
		return ["Chord", "Sankey", "Balken"];
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
		let normalizedData = R.filter((item) => item.Wert >= this.state.threshold, this.props.data);
		// @ts-ignore
		let chart = null;
		if (this.props.type === "Sankey")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.SankeyDiagram);
			this.initializeChartSankeyChord(chart);
			normalizedData = R.reject((item) => item.Von === item.Nach, normalizedData);
		}
		else if (this.props.type === "Chord")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.ChordDiagram);
			this.initializeChartSankeyChord(chart);
		}
		else if (this.props.type === "Balken")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.XYChart);
			this.initializeChartBar(chart);
		}
		/*else
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.SankeyDiagram);
		}*/
		chart.data = normalizedData;
		return chart;
	}

	// @ts-ignore
	private initializeChartSankeyChord(chart: Chart)
	{
		chart.nodes.template.tooltipText = "nodes.template {Von} → {Nach}: {Wert}";
		chart.links.template.tooltipText = "links.template {Von} → {Nach}: {Wert}";
		chart.dataFields.fromName = "Von";
		chart.dataFields.toName = "Nach";
		chart.dataFields.value = "Wert";
	}

	// @ts-ignore
	private initializeChartBar(chart: Chart)
	{
		// @ts-ignore
		var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "Von";
		// @ts-ignore
		var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
		// @ts-ignore
		var series = chart.series.push(new am4charts.ColumnSeries());
		series.dataFields.valueX = "Wert";
		series.dataFields.categoryY = "Von";
		series.name = "Nach";
	}

	private getMinMax(): [number, number]
	{
		let max = Number.MIN_VALUE;
		let second_max = Number.MIN_VALUE;
		let min = Number.MAX_VALUE;
		if (this.props.data)
		{
			for (let item of this.props.data)
			{
				if (item["Wert"] < min)
				{
					min = item["Wert"];
				}
				if (item["Wert"] > max)
				{
					if (max > second_max)
					{
						second_max = max;
					}
					max = item["Wert"];
				}
				else if (item["Wert"] > second_max)
				{
					second_max = item["Wert"];
				}
			}
		}
		return [min, second_max + 1];
	}

}
