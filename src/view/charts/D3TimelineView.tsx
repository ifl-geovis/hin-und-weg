import React from "react";
import ChartConfigView from "./ChartConfigView";
import { D3Timeline, ITimelineD3Item} from "./D3Timeline";
import ContainerDimensions from 'react-container-dimensions';

export interface ID3TimelinrViewProps
{
	items: ITimelineD3Item[];
	// theme: string;
}

// interface ID3ChartViewState
// {
// 	chartType: string;
// }

export default class TimelineViewD3 extends React.Component<ID3TimelinrViewProps>
{

	constructor(props: ID3TimelinrViewProps)
	{
		super(props);
		this.onChartTypeSelect = this.onChartTypeSelect.bind(this);
		// this.state =
		// {
		// 	// chartType: ChartView.getTypes()[0],
		// };
    }
    

	public render(): JSX.Element
	{
        
        

		return (
			<div className="p-grid">
				{/* <div className="p-col-4">Bar Chart "Von"</div> */}
				{/* <div className="p-col-8">
					<ChartConfigView diagramTypes={ChartView.getTypes()} selected={this.state.chartType} onSelectChartType={this.onChartTypeSelect}/>
				</div> */}
                
				

				<div id="chartDiv" className="p-col-12">
                    <ContainerDimensions>
                        { ({ width, height }) => 
                            <D3Timeline width={width} height={width/2} data={this.props.items}/>
                        }
                    </ContainerDimensions>
					
				</div>
				
			</div>
		);
    }
    

	private onChartTypeSelect(selected: string)
	{
		this.setState({chartType: selected});
	}

}