import React from "react";
import ChartConfigView from "./ChartConfigView";
import { ChartView, IChartItem} from "./ChartView";

export interface IChartsViewProps {
    items: IChartItem[];
}

interface IChartsViewState {
    chartType: string;
}

export default class ChartsView extends React.Component<IChartsViewProps, IChartsViewState> {

    constructor(props: IChartsViewProps) {
        super(props);
        this.onChartTypeSelect = this.onChartTypeSelect.bind(this);
        this.state = {
            chartType: ChartView.getTypes()[0],
        };
    }

    public render(): JSX.Element {
        return (
            <div>
                <ChartConfigView onSelectChartType={this.onChartTypeSelect} diagramTypes={ChartView.getTypes()} />
                <ChartView data={this.props.items} type={this.state.chartType}/>
            </div>
        );
    }

    private onChartTypeSelect(selected: string) {
        this.setState({chartType: selected});
    }
}
