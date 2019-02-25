import React from "react";
/*
// Does not work in electronjs, so we use the @ts-ignore annotation
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
*/
export default class ChartView extends React.Component {

  // @ts-ignore
  private chart: am4charts.Chart | null;

    constructor(props: {}) {
        super(props);
        this.chart = null;
    }

    public componentDidMount() {
      // @ts-ignore
      const chart = am4core.create("chartdiv", am4charts.XYChart);
      chart.paddingRight = 20;

      const data = [];
      let visits = 10;
      for (let i = 1; i < 366; i++) {
        visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
        data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
      }

      chart.data = data;
      // @ts-ignore
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
       // @ts-ignore
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;
      // @ts-ignore
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";

      series.tooltipText = "{valueY.value}";
      // @ts-ignore
      chart.cursor = new am4charts.XYCursor();
       // @ts-ignore
      const scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      chart.scrollbarX = scrollbarX;

      this.chart = chart;
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
}
