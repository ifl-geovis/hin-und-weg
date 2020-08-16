import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

import SelectInput from "../input/SelectInput";
import Config from "../../config";
import Classification from "../../data/Classification";

export interface IClassificationSelectionsProps
{
	positiveColors: string;
	negativeColors: string;
	setPositiveColorScheme: (newColorScheme: string) => void;
	setNegativeColorScheme: (newColorScheme: string) => void;
}

export default class ClassificationSelections extends React.Component<IClassificationSelectionsProps>
{

	constructor(props: IClassificationSelectionsProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		const positiveColorSchemes = Config.getKeys("colorschemes");
		const negativeColorSchemes = Config.getKeys("colorschemes");
		const indexPositive = positiveColorSchemes.indexOf(this.props.negativeColors);
		const indexNegative = negativeColorSchemes.indexOf(this.props.positiveColors);
		if (indexPositive > -1) {positiveColorSchemes.splice(indexPositive, 1);}
		if (indexNegative > -1) {negativeColorSchemes.splice(indexNegative, 1);}
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Klassifikation">
					<div>positive Skala</div>
					<SelectInput options={positiveColorSchemes} selected={this.props.positiveColors} onSelected={this.props.setPositiveColorScheme}/>
					<br /><br />
					<div>negative Skala</div>
					<SelectInput options={negativeColorSchemes} selected={this.props.negativeColors} onSelected={this.props.setNegativeColorScheme}/>
				</AccordionTab>
			</Accordion>
		);
	}

}