import { Result } from "cubus";
import R from "ramda";
import React from "react";

// Does not work in electronjs, so we use the @ts-ignore annotation
// For development (hint types, autocompletion) uncomment this 2 lines below
// import * as am4core from '@amcharts/amcharts4/core';
// import * as am4charts from '@amcharts/amcharts4/charts';

export interface IChartViewProps {
  data: Array<Result<number>>;
  type: string;
}

export default class ChartView extends React.Component<IChartViewProps> {

  // @ts-ignore
  private chart: am4charts.Chart | null;

  constructor(props: IChartViewProps) {
    super(props);
    this.chart = null;
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
      <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
    );
  }

  private createChart() {
    // @ts-ignore
    let chart = null;
    if (this.props.type === "Sankey"){
      // @ts-ignore
      chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
    } else if (this.props.type === "Chord"){
      // @ts-ignore
      chart = am4core.create("chartdiv", am4charts.ChordDiagram);
    } else {
      // @ts-ignore
      chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
    }
    const notSameFromTo = (item: Result<number>) => {
        return  item.property[1].value !== item.property[2].value;
    };
    const createItem = (item: Result<number>) => {
      return { from: item.property[1].value , to: item.property[2].value , value: item.value};
    };
    const linkTemplate = chart.links.template;
    linkTemplate.tooltipText = "Von {fromName} nach {toName}: {value.value}";
    chart.data = R.map(createItem, R.filter(notSameFromTo, this.props.data));
    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";
    return chart;
  }

}
