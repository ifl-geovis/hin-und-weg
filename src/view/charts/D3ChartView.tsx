import BaseData from "../../data/BaseData";
import React from "react";
import  D3Chart, {ID3ChartItem} from "./D3Chart";
import Classification from '../../data/Classification';
import ContainerDimensions from 'react-container-dimensions';
import { RadioButton } from "primereact/radiobutton";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface ID3ChartViewProps extends WithNamespaces
{
	basedata: BaseData;
	items: ID3ChartItem[];
	theme: string;
	vizID: number;
	 baseViewId: number;
	yearsSelected: string[];
	dataProcessing:string;

}
interface ID3ChartViewState
{
  scale: string,
}


// export default 
class D3ChartView extends React.Component<ID3ChartViewProps, ID3ChartViewState>
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
		const {t}:any = this.props ;
		const heightResponsive =
		this.props.items.length <= 2
			? this.props.items.length * 50
			: this.props.items.length > 2 && this.props.items.length <= 5
			? this.props.items.length * 35
			: this.props.items.length > 5 && this.props.items.length < 30
			? this.props.items.length * 25
			: this.props.items.length * 20;
		
			const classification = this.props.basedata.getClassification();
			const positive_scales = classification.getPositiveScales();
			const positive_colors = classification.getPositiveColors();
			const negative_scales = classification.getNegativeScales();
			const negative_colors = classification.getNegativeColors();
			return (
			<div className="p-grid">
				<div className="p-col-4 noprint"> <RadioButton inputId='rb1' value='width100' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})}  checked={this.state.scale === 'width100'}  />  <label className="p-checkbox-label">{t('charts.scale100')}</label> </div>
				<div className="p-col-4 noprint"> <RadioButton inputId='rb2' value='width75' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width75'} /> <label className="p-checkbox-label">{t('charts.scale75')}</label>  </div>
				<div className="p-col-4 noprint"> <RadioButton inputId='rb3' value='width50' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width50'} /> <label className="p-checkbox-label">{t('charts.scale50')}</label> </div>
				{/* <div className="p-col-3"> <RadioButton inputId='rb4' value='width25' name='scaleSankey' onChange={(e: { value: string, checked: boolean }) => this.setState({scale: e.value})} checked={this.state.scale === 'width25'} /> <label className="p-checkbox-label">Skalierung 25%</label> </div> */}

				<div id="chartDiv" className="p-col-12">
						  <ContainerDimensions>
								{ ({ width, height }) =>
							<D3Chart basedata={this.props.basedata} baseViewId={this.props.baseViewId} vizID={this.props.vizID}
							yearsSelected={this.props.yearsSelected}
							width={this.state.scale === "width100" ? width : this.state.scale === "width75" ? width*0.75 : this.state.scale === "width50" ? width*0.5 : this.state.scale === "width25" ? width*0.25 : width}
							height={heightResponsive}
							data={this.props.items} theme={this.props.theme} dataProcessing={this.props.dataProcessing} 
							positive_colors={positive_colors} negative_colors={negative_colors} positive_scales={positive_scales} negative_scales={negative_scales} />
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
export default withNamespaces()(D3ChartView);
