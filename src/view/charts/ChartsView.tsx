import { Result } from "cubus";
import R from "ramda";
import React from "react";
import ChartChooserView from "./ChartChooserView";
import ChartView from "./ChartView";
// import LegendView from "./LegendView";

export interface IChartsViewProps {
    datas: Array<Result<number>>;
}

interface IChartsViewState {
    chartType: string;
    chartRange: string | null;
}

export default class ChartsView extends React.Component<IChartsViewProps, IChartsViewState> {

    constructor(props: IChartsViewProps) {
        super(props);
        this.onChartTypeSelect = this.onChartTypeSelect.bind(this);
        this.onRangeSelect = this.onRangeSelect.bind(this);
        this.state = {
            chartRange: null,
            chartType: "Liniendiagramm",
        };
    }

    public render(): JSX.Element{
        const ranges = [] as string[];
        return (
            <div>
                <ChartChooserView 
                    onSelectRange={this.onRangeSelect}
                    onSelectChartType={this.onChartTypeSelect}
                    diagramTypes={["Liniendiagramm", "Balkendiagramm", "Sankey"]}
                    rangeTypes={ranges}
                />
                <ChartView data={this.props.datas}/>
            </div>
        );
    }

    private onChartTypeSelect(selected: string) {
        this.setState({chartType: selected});
    }

    private onRangeSelect(selected: string) {
        this.setState({chartRange: selected});
    }
}
