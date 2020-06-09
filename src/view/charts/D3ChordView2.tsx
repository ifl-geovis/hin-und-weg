import React from "react";
// import ChartConfigView from "./ChartConfigView";
import { D3Chord2, ID3ChordItem} from "./D3Chord2";
import ContainerDimensions from 'react-container-dimensions';

export interface ID3ChordViewProps
{
	items: ID3ChordItem[];
	theme: string;
}


export default class D3chordChartsView extends React.Component<ID3ChordViewProps>
{

	constructor(props: ID3ChordViewProps)
	{
		super(props);
		this.onChartTypeSelect = this.onChartTypeSelect.bind(this);
    }
    

	public render(): JSX.Element
	{

		return (
			<div className="p-grid">
				<div id="chartDivChord" className="p-col-12">
                    <ContainerDimensions>
                        { ({ width, height }) => 
                            <D3Chord2 width={width} height={width} data={this.props.items} theme={this.props.theme}/>
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
