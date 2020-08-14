import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

import SelectInput from "../input/SelectInput";
import Config from "../../config";
import Classification from "../../data/Classification";

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
		this.setPositiveColorScheme = this.setPositiveColorScheme.bind(this);
		this.setNegativeColorScheme = this.setNegativeColorScheme.bind(this);
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
					<SelectInput options={positiveColorSchemes} selected={this.state.positiveColors} onSelected={this.setPositiveColorScheme}/>
					<br /><br />
					<div>negative Skala</div>
					<SelectInput options={negativeColorSchemes} selected={this.state.negativeColors} onSelected={this.setNegativeColorScheme}/>
				</AccordionTab>
			</Accordion>
		);
	}

	private setPositiveColorScheme(newColorScheme: string)
	{
		this.setState({positiveColors: newColorScheme});
		Classification.getCurrentClassification().setPositiveColors(Config.getValue("colorschemes", newColorScheme)["7"]);
	}

	private setNegativeColorScheme(newColorScheme: string)
	{
		this.setState({negativeColors: newColorScheme});
		Classification.getCurrentClassification().setNegativeColors(Config.getValue("colorschemes", newColorScheme)["7"]);
	}

}