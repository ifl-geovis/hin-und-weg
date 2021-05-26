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
	colorSchemes: string[];
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
		{label: "arithmetische Reihe", value: "arithmetic_progression"},
		{label: "benutzerdefiniert", value: "custom"},
		{label: "Brüche nach Jenks", value: "jenks"},
		{label: "geometrische Reihe", value: "geometric_progression"},
		//{label: "Standardabweichung", value: "stddeviation"},
		{label: "Quantile", value: "quantile"},
	];
	private classes : string[] = ["1 Klasse", "2 Klassen", "3 Klassen", "4 Klassen", "5 Klassen", "6 Klassen", "7 Klassen", "8 Klassen", "9 Klassen"];

	constructor(props: IClassificationSelectionsProps)
	{
		super(props);
		this.setAlgorithm = this.setAlgorithm.bind(this);
		this.setPositiveColors = this.setPositiveColors.bind(this);
		this.setNegativeColors = this.setNegativeColors.bind(this);
	}

	public render(): JSX.Element
	{
		const label = (this.props.withNegative) ? 'positive Skala und Farbschema' : 'Skala und Farbschema';
		let negativeScale;
		if (this.props.withNegative) negativeScale = this.getNegativeScale();
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Klassifikation">
					<Dropdown optionLabel="label" value={this.getSelectedAlgorithm()} options={this.algorithms} onChange={this.setAlgorithm} style={{width: "100%"}}/>
					<br /><br />
					<div>{label}</div>
					<SelectInput options={this.classes} selected={(this.props.positiveClasses == "1") ? (this.props.positiveClasses + " Klasse") : (this.props.positiveClasses + " Klassen")} onSelected={this.props.setPositiveClasses}/>
					<Dropdown optionLabel="label" options={this.createColorOptions(this.props.colorSchemes)} value={this.getSelectedColorscheme(this.props.positiveColors)} onChange={this.setPositiveColors} style={{ width: "100%" }}/>
					{negativeScale}
				</AccordionTab>
			</Accordion>
		);
	}

	private createColorOptions(raw: string[]): any[] {
		let results: any[] = [];
		for (let colorscheme of raw) {
			let item = {label: colorscheme, value: colorscheme};
			if (colorscheme.startsWith('scheme')) item.label = 'Schema ' + colorscheme.substring(6);
			results.push(item);
		}
		return results;
	}

	private getSelectedColorscheme(selectedColor: string)
	{
		for (let colorscheme of this.createColorOptions(this.props.colorSchemes))
		{
			if (colorscheme.value === selectedColor) return colorscheme;
		}
		return this.createColorOptions(this.props.colorSchemes)[0];
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

	private setPositiveColors(event: { originalEvent: Event, value: any}) {
		this.props.setPositiveColorScheme(event.value.value);
	}

	private setNegativeColors(event: { originalEvent: Event, value: any}) {
		this.props.setNegativeColorScheme(event.value.value);
	}

	private getNegativeScale() {
		return (
			<div>
				<br /><br />
				<div>negative Skala und Farbschema</div>
				<SelectInput options={this.classes} selected={(this.props.negativeClasses == "1") ? (this.props.negativeClasses + " Klasse") : (this.props.negativeClasses + " Klassen")} onSelected={this.props.setNegativeClasses}/>
				<Dropdown optionLabel="label" options={this.createColorOptions(this.props.colorSchemes)} value={this.getSelectedColorscheme(this.props.negativeColors)} onChange={this.setNegativeColors} style={{ width: "100%" }}/>
			</div>
		);
	}

}