import React from "react";
import SelectInput from "../input/SelectInput";

export interface IChartConfigViewProps {
    diagramTypes: string[];
    onSelectChartType: (name: string) => void;
}

export default class ChartConfigView extends React.Component<IChartConfigViewProps> {

    constructor(props: IChartConfigViewProps) {
        super(props);
    }

    public render(): JSX.Element {
       return (
            <div>
                <SelectInput options={this.props.diagramTypes} onSelected={this.props.onSelectChartType}/>
            </div>
       );
    }
  }
