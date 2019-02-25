import { Result } from "cubus";
import R from "ramda";
import React from "react";

// Does not work in electronjs, so we use the @ts-ignore annotation
//import * as am4core from '@amcharts/amcharts4/core';
//import * as am4charts from '@amcharts/amcharts4/charts';

export interface IChartViewProps {
  data: Array<Result<number>>;
}

export default class ChartView extends React.Component<IChartViewProps> {

  // @ts-ignore
  private chart: am4charts.Chart | null;

  constructor(props: IChartViewProps) {
    super(props);
    this.chart = null;
  }

  public componentDidMount() {
    this.chart = this.createSanykeyChart();
  }

  public componentDidUpdate() {
    if (this.chart) {
      this.chart.dispose();
    }
    this.chart = this.createSanykeyChart();
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

  private createSanykeyChart() {
    // @ts-ignore
    const chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
    const createItem = (item: Result<number>) => {
      return { from: item.property[1].value , to: item.property[2].value , value: item.value};
    };
    // How to get real tooltip values ?
    //chart.tooltipText = "1. {valueFromName} 2. {valuefromName} 3.{fromName} "
    chart.data = R.map(createItem, this.props.data);
    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";
    return chart;
  }

}
