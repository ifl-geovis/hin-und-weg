import React from "react";
import { D3Timeline2, ITimelineD3Item} from "./D3Timeline2";
import ContainerDimensions from 'react-container-dimensions';

export interface ID3TimelinrViewProps
{
	items: ITimelineD3Item[];
}


export default class TimelineViewD3 extends React.Component<ID3TimelinrViewProps>
{

	constructor(props: ID3TimelinrViewProps)
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
                            <D3Timeline2 width={width} height={width/2} data={this.props.items}/>
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
