import React from "react";
import { D3Histogram} from "./D3Histogram";
import ContainerDimensions from 'react-container-dimensions';
import Classification from '../../data/Classification';


export interface ID3HistogramViewProps
{
	theme: string;
	vizID: number;
	baseViewId: number;
	yearsSelected: string[];
}



export default class HistogramView extends React.Component<ID3HistogramViewProps>
{

	


	public render(): JSX.Element
	{
		const classification = Classification.getCurrentClassification();
		const algorithm_ = classification.getAlgorithm();
		const positive_scales = classification.getPositiveScales();
        const positive_scales_d3labels = classification.getPositiveScalesD3Labels();
		const negative_scales = classification.getNegativeScales();
		const negative_scales_d3labels = classification.getNegativeScalesD3Labels();

        const positiveValues :number[] = classification.getPositiveStatsSerie();
		let positiveScales: any[] =[];
		let positiveScalesD3Labels :any[] = [];
		let positiveScalesShort: any[] =[];
		let algorithm: string = "";
		let positiveScalesString: string[] = [];

		const negativeValues :number[] = classification.getNegativeStatsSerie();
		let negativeScales: any[] = [];
		let negativeScalesD3Labels : any[] = [];
		let negativeScalesShort : any[] = [];
		let negativeScalesString : string[] = [];


		
		if (positive_scales !== null && positive_scales_d3labels !== null && algorithm_ !== null) {
			positiveScales = positive_scales;
			positiveScalesString = positiveScales.map(num => {return num.toString()})
			positiveScalesD3Labels = positive_scales_d3labels;
			algorithm = algorithm_;
			let pos_ScalesShort = (ar1:any[]) => {
				let ar2 : any[] = []
					for (let i = 0; i < ar1.length - 1; i++){
					ar2[i] = ar1[i]}
					return ar2
			}
			positiveScalesShort = pos_ScalesShort(positive_scales);

		}

		if (negative_scales !== null && negative_scales_d3labels !== null && algorithm_ !== null) {
			negativeScales = negative_scales;
			negativeScalesString = negativeScales.map(num => {return num.toString()})

			negativeScalesD3Labels = negative_scales_d3labels;
			algorithm = algorithm_;
			let neg_ScalesShort = (ar1:any[]) => {
				let ar2 : any[] = []
					for (let i = 0; i < ar1.length - 1; i++){
					ar2[i] = ar1[i]}
					return ar2
			}
			negativeScalesShort = neg_ScalesShort(negative_scales);

		}

		const positive_colors = classification.getPositiveColors();
		const negative_colors = classification.getNegativeColors();


		return (
			<div className="p-grid">
				
				<div id="chartDiv" className="p-col-12">
						  <ContainerDimensions>
								{ ({ width, height }) =>
								<D3Histogram width={width} height={320}
								baseViewId={this.props.baseViewId} vizID={this.props.vizID} 
								theme={this.props.theme} yearsSelected={this.props.yearsSelected}
								positive_scales={positiveScalesD3Labels} positive_scales_short={positiveScalesShort} 
								positive_scales_string={positiveScalesString} 
								positiveValues={positiveValues} 
								positive_colors={positive_colors}
								negative_scales = {negativeScalesD3Labels} negative_scales_short = {negativeScalesShort}
								negative_scales_string = {negativeScalesString}
								negativeValues = {negativeValues}
								negative_colors = {negative_colors}
								algorithm={algorithm} />
								}
						  </ContainerDimensions>

				</div>

			</div>
		);
	 }




}
