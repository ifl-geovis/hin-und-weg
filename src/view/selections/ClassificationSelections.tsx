import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

import SelectInput from "../input/SelectInput";
import Config from "../../config";
import Classification from "../../data/Classification";

export interface IClassificationSelectionsProps
{
	positiveColors: string;
	negativeColors: string;
	positiveClasses: string;
	negativeClasses: string;
	setPositiveColorScheme: (newColorScheme: string) => void;
	setNegativeColorScheme: (newColorScheme: string) => void;
	setPositiveClasses: (classes: string) => void;
	setNegativeClasses: (classes: string) => void;
}

export default class ClassificationSelections extends React.Component<IClassificationSelectionsProps>
{

	private classes : string[] = ["1 Klasse", "2 Klassen", "3 Klassen", "4 Klassen", "5 Klassen", "6 Klassen", "7 Klassen", "8 Klassen", "9 Klassen"];

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
					<SelectInput options={this.classes} selected={(this.props.positiveClasses == "1") ? (this.props.positiveClasses + " Klasse") : (this.props.positiveClasses + " Klassen")} onSelected={this.props.setPositiveClasses}/>
					<SelectInput options={positiveColorSchemes} selected={this.props.positiveColors} onSelected={this.props.setPositiveColorScheme}/>
					<br /><br />
					<div>negative Skala</div>
					<SelectInput options={this.classes} selected={(this.props.negativeClasses == "1") ? (this.props.negativeClasses + " Klasse") : (this.props.negativeClasses + " Klassen")} onSelected={this.props.setNegativeClasses}/>
					<SelectInput options={negativeColorSchemes} selected={this.props.negativeColors} onSelected={this.props.setNegativeColorScheme}/>
				</AccordionTab>
			</Accordion>
		);
	}

}