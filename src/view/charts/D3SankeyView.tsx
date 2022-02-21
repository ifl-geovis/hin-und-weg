import BaseData from "../../data/BaseData";
import React from "react";
// import ChartConfigView from "./ChartConfigView";
import D3Sankey, {ID3SankeyItem} from "./D3Sankey";
import ContainerDimensions from 'react-container-dimensions';
import { RadioButton } from "primereact/radiobutton";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface ID3SankeyViewProps extends WithNamespaces
{
	basedata: BaseData;
	items: ID3SankeyItem[];
	theme: string;
	vizID: number;
	 baseViewId: number;
	yearsSelected: string[];
	dataProcessing:string;

}
interface ID3SankeyViewState
{
//   scale: string,
}
// export default 
class D3SankeyView extends React.Component<ID3SankeyViewProps, ID3SankeyViewState>
{

	constructor(props: ID3SankeyViewProps)
	{
		super(props);
		this.state = {
			// scale: 'width100',
		}
		// this.onChartTypeSelect = this.onChartTypeSelect.bind(this);
	 }


	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		return (
			<div className="p-grid">
				{/* <div className="p-col-4 noprint"> <RadioButton inputId='rb1' value='width100' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})}  checked={this.state.scale === 'width100'}  />  <label className="p-checkbox-label">{t('charts.scale100')}</label> </div>
				<div className="p-col-4 noprint"> <RadioButton inputId='rb2' value='width75' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width75'} /> <label className="p-checkbox-label">{t('charts.scale75')}</label>  </div>
				<div className="p-col-4 noprint"> <RadioButton inputId='rb3' value='width50' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width50'} /> <label className="p-checkbox-label">{t('charts.scale50')}</label> </div> */}
				{/* <div className="p-col-3"> <RadioButton inputId='rb4' value='width25' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width25'} /> <label className="p-checkbox-label">Skalierung 25%</label> </div> */}


				<div id="chartDiv" className="p-col-12">
						  <ContainerDimensions>
								{ ({ width, height }) =>
									<D3Sankey basedata={this.props.basedata} baseViewId={this.props.baseViewId} vizID={this.props.vizID}
									 yearsSelected={this.props.yearsSelected }
							width={width}
							// width={this.state.scale === "width100" ? width : this.state.scale === "width75" ? width*0.75 : this.state.scale === "width50" ? width*0.5 : this.state.scale === "width25" ? width*0.25 : width}
							height={(this.props.items.length <= 15)? 700 : 1100}
							data={this.props.items} theme={this.props.theme} dataProcessing={this.props.dataProcessing} />
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
export default withNamespaces()(D3SankeyView);
