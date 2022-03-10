import BaseData from "../../data/BaseData";
import React from "react";
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
}
// export default 
class D3SankeyView extends React.Component<ID3SankeyViewProps, ID3SankeyViewState>
{

	constructor(props: ID3SankeyViewProps)
	{
		super(props);
		this.state = {
		}
	 }


	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		return (
			<div className="p-grid">
				
				<div id="chartDiv" className="p-col-12">
						  <ContainerDimensions>
								{ ({ width, height }) =>
									<D3Sankey basedata={this.props.basedata} baseViewId={this.props.baseViewId} vizID={this.props.vizID}
									 yearsSelected={this.props.yearsSelected }
							width={width}
							height={(this.props.items.length <= 15)? 700 : 1100}
							data={this.props.items} theme={this.props.theme} dataProcessing={this.props.dataProcessing} />
						}
						  </ContainerDimensions>

				</div>

			</div>
		);
	 }

}
export default withNamespaces()(D3SankeyView);
