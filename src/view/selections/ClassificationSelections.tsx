import React, {MouseEvent} from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Dropdown } from "primereact/dropdown";
import { Button } from 'primereact/button';

import SelectInput from "../input/SelectInput";
import Config from "../../config";
import Classification from "../../data/Classification";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IClassificationSelectionsProps extends WithNamespaces
{
	algorithm: string;
	positiveColors: string;
	negativeColors: string;
	positiveClasses: string;
	negativeClasses: string;
	colorSchemes: string[];
	withNegative: boolean;
	automaticButton: boolean;
	setAlgorithm: (newAlgorithm: string) => void;
	setPositiveColorScheme: (newColorScheme: string) => void;
	setNegativeColorScheme: (newColorScheme: string) => void;
	setPositiveClasses: (classes: string) => void;
	setNegativeClasses: (classes: string) => void;
	resetAutomaticClasses: (automatic: boolean) => void;
}

 class ClassificationSelections extends React.Component<IClassificationSelectionsProps>
{


	private algorithms = [
		{label: "abstandsgetreu", value: "equidistant", translatedLabel: "classificationSelections.classifications.equidistant"},
		{label: "arithmetische Reihe", value: "arithmetic_progression", translatedLabel: "classificationSelections.classifications.arithmetic_progression"},
		{label: "benutzerdefiniert", value: "custom", translatedLabel: "classificationSelections.classifications.custom"},
		{label: "Brüche nach Jenks", value: "jenks", translatedLabel: "classificationSelections.classifications.jenks"},
		{label: "geometrische Reihe", value: "geometric_progression", translatedLabel: "classificationSelections.classifications.geometric_progression"},
		{label: "Standardabweichung", value: "stddeviation", translatedLabel: "classificationSelections.classifications.stddeviation"},
		{label: "Quantile", value: "quantile", translatedLabel: "classificationSelections.classifications.quantile"},
	];

	constructor(props: IClassificationSelectionsProps)
	{
		super(props);
		this.setAlgorithm = this.setAlgorithm.bind(this);
		this.setPositiveColors = this.setPositiveColors.bind(this);
		this.setNegativeColors = this.setNegativeColors.bind(this);
		this.resetAutomaticClasses = this.resetAutomaticClasses.bind(this);
	}

	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		const classesRender : string[] = i18n.t('classificationSelections.classesArray', { returnObjects: true });
		const algorithmsRender = [
			{label: "abstandsgetreu", value: "equidistant", translatedLabel: t("classificationSelections.classifications.equidistant")},
			{label: "arithmetische Reihe", value: "arithmetic_progression", translatedLabel: t("classificationSelections.classifications.arithmetic_progression")},
			{label: "benutzerdefiniert", value: "custom", translatedLabel: t("classificationSelections.classifications.custom")},
			{label: "Brüche nach Jenks", value: "jenks", translatedLabel: t("classificationSelections.classifications.jenks")},
			{label: "geometrische Reihe", value: "geometric_progression", translatedLabel: t("classificationSelections.classifications.geometric_progression")},
			{label: "Standardabweichung", value: "stddeviation", translatedLabel: t("classificationSelections.classifications.stddeviation")},
			{label: "Quantile", value: "quantile", translatedLabel: t("classificationSelections.classifications.quantile")},
		];
		const label = (this.props.withNegative) ? t('classificationSelections.scaleAndColorsPositive') : t('classificationSelections.scaleAndColors');
		// const label = (this.props.withNegative) ? 'positive Skala und Farbschema' : 'Skala und Farbschema';
		let negativeScale;
		if (this.props.withNegative) negativeScale = this.getNegativeScale();
		const automaticClassesButton = this.getAutomaticClassesButton();
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header={t('classificationSelections.classification')}>
					<Dropdown optionLabel="translatedLabel" value={this.getSelectedAlgorithm()} options={algorithmsRender} onChange={this.setAlgorithm} style={{width: "100%"}} />
					{this.props.algorithm != 'stddeviation' && (
						<div><br />
						<div>{label}</div>
						<SelectInput options={classesRender} selected={(this.props.positiveClasses == "1") ? (this.props.positiveClasses + t('classificationSelections.class')) : (this.props.positiveClasses + t('classificationSelections.classes'))} onSelected={this.props.setPositiveClasses}/>
						<Dropdown optionLabel="label" options={this.createColorOptions(this.props.colorSchemes)} value={this.getSelectedColorscheme(this.props.positiveColors)} onChange={this.setPositiveColors} style={{ width: "100%" }}/>
						{negativeScale}
						{automaticClassesButton}
						</div>
					)}
				</AccordionTab>
			</Accordion>
		);
	}

	private createColorOptions(raw: string[]): any[] {
		console.log("ClassSelections color schemes: " + this.props.colorSchemes);
		const {t}:any = this.props ;
		let results: any[] = [];
		for (let colorscheme of raw) {
			let item = {label: colorscheme, value: colorscheme};
			if (colorscheme.startsWith('scheme')) item.label = t('classificationSelections.scheme') + colorscheme.substring(6);
			if (colorscheme === "orange") item.label = t('classificationSelections.orange');
			if (colorscheme === "rot") item.label = t('classificationSelections.red');
			if (colorscheme === "blau") item.label = t('classificationSelections.blue');
			if (colorscheme === "grün") item.label = t('classificationSelections.green');
			results.push(item);
		}
		return results;
	}

	private getSelectedColorscheme(selectedColor: string)
	{
		for (let colorscheme of this.createColorOptions(this.props.colorSchemes))
		{
			if (colorscheme.value === selectedColor) return colorscheme.value;
		}
		return this.createColorOptions(this.props.colorSchemes)[0].value;
	}

	private getSelectedAlgorithm()
	{
		for (let algorithm of this.algorithms)
		{
			if (algorithm.value === this.props.algorithm) return algorithm.value;
		}
		return this.algorithms[0].value;
	}

	private setAlgorithm(event: { originalEvent: Event, value: any}) {
		this.props.setAlgorithm(event.value);
	}

	private setPositiveColors(event: { originalEvent: Event, value: any}) {
		this.props.setPositiveColorScheme(event.value);
	}

	private setNegativeColors(event: { originalEvent: Event, value: any}) {
		this.props.setNegativeColorScheme(event.value);
	}

	private resetAutomaticClasses(e: MouseEvent) {
		this.props.resetAutomaticClasses(true);
	}

	private getNegativeScale() {
		const {t}:any = this.props ;
		const classesRender : string[] = i18n.t('classificationSelections.classesArray', { returnObjects: true });
		return (
			<div>
				<br />
				<div>{t('classificationSelections.scaleAndColorsNegative')}</div>
				<SelectInput options={classesRender} selected={(this.props.negativeClasses == "1") ? (this.props.negativeClasses + t('classificationSelections.class')) : (this.props.negativeClasses + t('classificationSelections.classes'))} onSelected={this.props.setNegativeClasses}/>
				<Dropdown optionLabel="label" options={this.createColorOptions(this.props.colorSchemes)} value={this.getSelectedColorscheme(this.props.negativeColors)} onChange={this.setNegativeColors} style={{ width: "100%" }}/>
			</div>
		);
	}

	private getAutomaticClassesButton() {
		const {t}:any = this.props ;
		if (!this.props.automaticButton) return null;
		return (
			<div>
				<br />
				<Button onClick={this.resetAutomaticClasses} label={t('classificationSelections.classesNumber')}/>
			</div>
		);
	}

}
export default withNamespaces()(ClassificationSelections);
