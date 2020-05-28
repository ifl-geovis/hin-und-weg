import React from "react";
// import ChartConfigView from "./ChartConfigView";
import { D3Sankey, ID3SankeyItem} from "./D3Sankey";
import ContainerDimensions from 'react-container-dimensions';

export interface ID3SankeyViewProps
{
	items: ID3SankeyItem[];
	theme: string;
}

export default class D3SankeyChartsView extends React.Component<ID3SankeyViewProps>
{

	constructor(props: ID3SankeyViewProps)
	{
		super(props);
		this.onChartTypeSelect = this.onChartTypeSelect.bind(this);
    }
    

	public render(): JSX.Element
	{
        
        

		return (
			<div className="p-grid">
                
				<div id="chartDiv" className="p-col-12">
                    <ContainerDimensions>
                        { ({ width, height }) => 
                            <D3Sankey width={width} height={(this.props.items.length <= 15)? 700 : 1000} data={this.props.items} theme={this.props.theme}/>
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
