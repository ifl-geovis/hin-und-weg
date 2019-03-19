import R from "ramda";
import React from "react";

// Does not work in electronjs, so we use the @ts-ignore annotation
// For development (hint types, autocompletion) uncomment this 2 lines below
// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';

export interface IChartItem {
  [name: string]: number;
}

export interface IChartViewProps {
  data: IChartItem[];
  type: string;
}

export class ChartView extends React.Component<IChartViewProps> {

  public static getTypes(): string[] {
    return ["Chord", "Sankey"];
  }

  private static idCounter: number = 0;
  // @ts-ignore
  private chart: am4charts.Chart | null;
  private id: number;

  constructor(props: IChartViewProps) {
    super(props);
    this.chart = null;
    ChartView.idCounter++;
    this.id = ChartView.idCounter;
  }

  public componentDidMount() {
    this.chart = this.createChart();
  }

  public componentDidUpdate() {
    if (this.chart) {
      this.chart.dispose();
    }
    this.chart = this.createChart();
  }

  public componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
  }

  public render(): JSX.Element {
    return (
      <div id={"chart-" + this.id} style={{ width: "100%", height: "800px" }}></div>
    );
  }

  private createChart() {
    // @ts-ignore
    let chart = null;
    if (this.props.type === "Sankey"){
      // @ts-ignore
      chart = am4core.create("chart-" + this.id, am4charts.SankeyDiagram);
    } else if (this.props.type === "Chord") {
      // @ts-ignore
      chart = am4core.create("chart-" + this.id, am4charts.ChordDiagram);
    } else {
      // @ts-ignore
      chart = am4core.create("chart-" + this.id, am4charts.SankeyDiagram);
    }
    const linkTemplate = chart.links.template;
    linkTemplate.tooltipText = "Von {fromName} nach {toName}: {value.value}";
    if ( this.props.type === "Sankey"){
      chart.data = R.reject((item) => item.Von === item.Nach, this.props.data);
    } else {
      chart.data = this.props.data;
    }
    chart.dataFields.fromName = "Von";
    chart.dataFields.toName = "Nach";
    chart.dataFields.value = "Wert";
    return chart;
  }

}
