import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

import SelectInput from "../input/SelectInput";
import Config from "../../config";

export interface IClassificationSelectionsProps
{
}

export interface IClassificationSelectionsState
{
	positiveColors: string;
	negativeColors: string;
}

export default class ClassificationSelections extends React.Component<IClassificationSelectionsProps, IClassificationSelectionsState>
{

	constructor(props: IClassificationSelectionsProps)
	{
		super(props);
		this.state =
		{
			positiveColors: "Berta1",
			negativeColors: "Casimir1",
		};
	}

	public render(): JSX.Element
	{
		const positiveColorSchemes = Config.getKeys("colorschemes");
		const negativeColorSchemes = Config.getKeys("colorschemes");
		const indexPositive = positiveColorSchemes.indexOf(this.state.negativeColors);
		const indexNegative = negativeColorSchemes.indexOf(this.state.positiveColors);
		if (indexPositive > -1) {positiveColorSchemes.splice(indexPositive, 1);}
		if (indexNegative > -1) {negativeColorSchemes.splice(indexNegative, 1);}
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Klassifikation">
					<div>positive Skala</div>
					<SelectInput options={positiveColorSchemes} selected={this.state.positiveColors} onSelected={(newColor) => this.setState({positiveColors: newColor})}/>
					<br /><br />
					<div>negative Skala</div>
					<SelectInput options={negativeColorSchemes} selected={this.state.negativeColors} onSelected={(newColor) => this.setState({negativeColors: newColor})}/>
				</AccordionTab>
			</Accordion>
		);
	}

}