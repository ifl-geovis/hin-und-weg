import React from "react";
import { D3Chart, ID3ChartItem} from "./D3Chart";
import ContainerDimensions from 'react-container-dimensions';
import { RadioButton } from "primereact/radiobutton";


export interface ID3ChartViewProps
{
	items: ID3ChartItem[];
	theme: string;
	vizID: number;
    baseViewId: number;
}
interface ID3ChartViewState
{
  scale: string,
}


export default class ChartsView extends React.Component<ID3ChartViewProps, ID3ChartViewState>
{

	constructor(props: ID3ChartViewProps)
	{
		super(props);
		this.state = {
			scale: 'width100',
		}
		// this.onChartTypeSelect = this.onChartTypeSelect.bind(this);

    }


	public render(): JSX.Element
	{


		return (
			<div className="p-grid">
				<div className="p-col-3"> <RadioButton inputId='rb1' value='width100' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})}  checked={this.state.scale === 'width100'}  />  <label className="p-checkbox-label">Skalierung 100%</label> </div>
				<div className="p-col-3"> <RadioButton inputId='rb2' value='width75' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width75'} /> <label className="p-checkbox-label">Skalierung 75%</label>  </div>
				<div className="p-col-3"> <RadioButton inputId='rb3' value='width50' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width50'} /> <label className="p-checkbox-label">Skalierung 50%</label> </div>
				<div className="p-col-3"> <RadioButton inputId='rb4' value='width25' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width25'} /> <label className="p-checkbox-label">Skalierung 25%</label> </div>
		
				<div id="chartDiv" className="p-col-12">
                    <ContainerDimensions>
                        { ({ width, height }) =>
							<D3Chart baseViewId={this.props.baseViewId} vizID={this.props.vizID}  
							width={this.state.scale === "width100" ? width : this.state.scale === "width75" ? width*0.75 : this.state.scale === "width50" ? width*0.5 : this.state.scale === "width25" ? width*0.25 : width} 
							height={(this.props.items.length < 20 )? this.props.items.length*50 : this.props.items.length*20} 
							data={this.props.items} theme={this.props.theme}/>
                        }
                    </ContainerDimensions>

				</div>

			</div>
		);
    }


	// private onChartTypeSelect(selected: string)
	// {
	// 	this.setState({chartType: selected});
	// }

}
