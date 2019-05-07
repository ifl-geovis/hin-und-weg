import {Slider} from "primereact/slider";

import R from "ramda";
import React from "react";

// Does not work in electronjs, so we use the @ts-ignore annotation
// For development (hint types, autocompletion) uncomment this 2 lines below
// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';

export interface IChartItem
{
	//[name: string]: number;
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface IChartViewProps
{
	data: IChartItem[];
	type: string;
	theme: string;
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
			normalizedData = R.reject((item) => item.Von === item.Nach, normalizedData);
			//normalizedData.push({"Von": normalizedData[0].Nach, "Nach": "__undefined", "Wert": 0});
			normalizedData = this.toAbsoluteValues(normalizedData);
			this.initializeChartSankeyChord(chart);
		}
		else if (this.props.type === "Chord")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.ChordDiagram);
			normalizedData = this.toAbsoluteValues(normalizedData);
			this.initializeChartSankeyChord(chart);
		}
		else if (this.props.type === "Balken")
		{
			// @ts-ignore
			chart = am4core.create("chart-" + this.id, am4charts.XYChart);
			normalizedData.unshift({"Von": "", "Nach": "", "Wert": 0, "Absolutwert": 0});
			this.initializeChartBar(chart);
		}
		chart.data = normalizedData;
		/*if (this.props.type === "Balken")
		{
			console.log(chart);
			console.log(chart.yAxes.values[0]);
			console.log(chart.yAxes.values[0].renderer.labels);
			console.log(chart.yAxes.values[0].renderer.grid);
			console.log(chart.series.values[0]);
			console.log(chart.series.values[0].dataItems.values[0]);
			//console.log(chart.series.values[0].dataItems.first.hidden);
			chart.yAxes.values[0].renderer.labels.values[0].disabled = true;
			//chart.yAxes.values[0].renderer.grid.values[0].disabled = true;
			chart.series.values[0].dataItems.first.hidden = true;
			chart.series.values[0].dataItems.first.visible = false;
			//chart.yAxes.values[0].renderer.labels.values[0].disabled = true;
			//chart.data.shift();
			//chart.yAxes.values[0].renderer.labels.template.disabled = false;
		}*/
		return chart;
	}

	// @ts-ignore
	private initializeChartSankeyChord(chart: Chart)
	{
		chart.nodes.template.tooltipText = "{Von} → {Nach}: [bold]{Wert}[/]";
		chart.links.template.tooltipText = "{Von} → {Nach}: [bold]{Wert}[/]";
		chart.dataFields.fromName = "Von";
		chart.dataFields.toName = "Nach";
		chart.dataFields.value = "Absolutwert";
	}

	// @ts-ignore
	private initializeChartBar(chart: Chart)
	{
		// @ts-ignore
		var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
		//categoryAxis.renderer.grid.template.location = 0;
		categoryAxis.renderer.minGridDistance = 0;
		categoryAxis.renderer.minLabelPosition = 0;
		categoryAxis.renderer.marginBottom = "10px";
		categoryAxis.renderer.paddingBottom = "10px";
		categoryAxis.renderer.fixedWidthGrid = true;
		categoryAxis.renderer.labels.template.disabled = false;
		// @ts-ignore
		var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
		// @ts-ignore
		var series = chart.series.push(new am4charts.ColumnSeries());
		series.name = this.props.theme;
		if (this.props.theme === "Von")
		{
			series.dataFields.categoryY = "Nach";
			categoryAxis.dataFields.category = "Nach";
		}
		else
		{
			series.dataFields.categoryY = "Von";
			categoryAxis.dataFields.category = "Von";
		}
		series.dataFields.valueX = "Wert";
		series.columns.template.tooltipText = "{Von} → {Nach}: [bold]{Wert}[/]";
		let columnTemplate = series.columns.template;
		columnTemplate.strokeWidth = 2;
		columnTemplate.strokeOpacity = 1;
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

	private toAbsoluteValues(data: IChartItem[]): IChartItem[]
	{
		var absolutes: IChartItem[];
		absolutes = [];
		for (let item of data)
		{
			let newitem = item;
			newitem["Absolutwert"] = item["Wert"];
			if (item["Wert"] < 0)
			{
				newitem["Absolutwert"] = - item["Wert"];
			}
			absolutes.push(newitem);
		}
		return absolutes;
	}

}
