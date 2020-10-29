import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dropdown } from "primereact/dropdown";

import SelectInput from "../input/SelectInput";
import Config from "../../config";
import Classification from "../../data/Classification";

export interface IClassificationSelectionsProps
{
	algorithm: string;
	positiveColors: string;
	negativeColors: string;
	positiveClasses: string;
	negativeClasses: string;
	setAlgorithm: (newAlgorithm: string) => void;
	setPositiveColorScheme: (newColorScheme: string) => void;
	setNegativeColorScheme: (newColorScheme: string) => void;
	setPositiveClasses: (classes: string) => void;
	setNegativeClasses: (classes: string) => void;
	withNegative: boolean;
}

export default class ClassificationSelections extends React.Component<IClassificationSelectionsProps>
{

	private algorithms = [
		{label: "abstandsgetreu", value: "equidistant"},
		{label: "Standardabweichung", value: "stddeviation"},
		{label: "arithmetische Reihe", value: "arithmetic_progression"},
		{label: "geometrische Reihe", value: "geometric_progression"},
		{label: "Quantile", value: "quantile"},
		{label: "Brüche nach Jenks", value: "jenks"},
	];
	private classes : string[] = ["1 Klasse", "2 Klassen", "3 Klassen", "4 Klassen", "5 Klassen", "6 Klassen", "7 Klassen", "8 Klassen", "9 Klassen"];

	constructor(props: IClassificationSelectionsProps)
	{
		super(props);
		this.setAlgorithm = this.setAlgorithm.bind(this);
	}

	public render(): JSX.Element
	{
		const positiveColorSchemes = Config.getKeys("colorschemes");
		const negativeColorSchemes = Config.getKeys("colorschemes");
		const label = (this.props.withNegative) ? 'positive Skala und Farbschema' : 'Skala und Farbschema';
		let negativeScale;
		if (this.props.withNegative) negativeScale = this.getNegativeScale(negativeColorSchemes);
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Klassifikation">
					<Dropdown optionLabel="label" value={this.getSelectedAlgorithm()} options={this.algorithms} onChange={this.setAlgorithm} style={{width: "100%"}}/>
					<br /><br />
					<div>{label}</div>
					<SelectInput options={this.classes} selected={(this.props.positiveClasses == "1") ? (this.props.positiveClasses + " Klasse") : (this.props.positiveClasses + " Klassen")} onSelected={this.props.setPositiveClasses}/>
					<SelectInput options={positiveColorSchemes} selected={this.props.positiveColors} onSelected={this.props.setPositiveColorScheme}/>
					{negativeScale}
				</AccordionTab>
			</Accordion>
		);
	}

	private getSelectedAlgorithm()
	{
		for (let algorithm of this.algorithms)
		{
			if (algorithm.value === this.props.algorithm) return algorithm;
		}
		return this.algorithms[0];
	}

	private setAlgorithm(event: { originalEvent: Event, value: any}) {
		this.props.setAlgorithm(event.value.value);
	}


	private getNegativeScale(negativeColorSchemes: any) {
		return (
			<div>
				<br /><br />
				<div>negative Skala und Farbschema</div>
				<SelectInput options={this.classes} selected={(this.props.negativeClasses == "1") ? (this.props.negativeClasses + " Klasse") : (this.props.negativeClasses + " Klassen")} onSelected={this.props.setNegativeClasses}/>
				<SelectInput options={negativeColorSchemes} selected={this.props.negativeColors} onSelected={this.props.setNegativeColorScheme}/>
			</div>
		);
	}

}