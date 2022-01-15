import BaseData from "../../data/BaseData";

import { Panel } from "primereact/panel";
import { RadioButton } from "primereact/radiobutton";
import R from "ramda";
import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IThemesProps extends WithNamespaces{
	basedata: BaseData;
	themes: string[];
	populationDataLoaded: boolean;
}

class Themes extends React.Component<IThemesProps> {

	constructor(props: IThemesProps) {
		super(props);
		this.makeRadioButton = this.makeRadioButton.bind(this);
		this.makeRadioButtonTheme = this.makeRadioButtonTheme.bind(this);
	}

	public render(): JSX.Element {
		const {t}:any = this.props ;
		const radioButtons = R.map(this.makeRadioButtonTheme, this.props.themes);
		const wanderungsselector = this.createWanderungsSelector();
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header={t('baseView.theme')}>
					{radioButtons}
					{wanderungsselector}
				</AccordionTab>
			</Accordion>
		);
	}

	private createWanderungsSelector(): JSX.Element {
		const {t}:any = this.props ;
		if (!this.props.populationDataLoaded) return (<span></span>);
		const absolute = this.makeRadioButton("absolute", t('themes.value'));
		const wanderungsrate = this.makeRadioButton("wanderungsrate", t('themes.rate'));
		return (
			<div>
				<hr />
				{absolute}
				{wanderungsrate}
			</div>
		);
	}

	private makeRadioButtonTheme(theme: string): JSX.Element {
		const {t}:any = this.props ;
		let themeLabel = theme === "Von" ? t('themes.from') : theme === "Nach" ? t('themes.to') : theme === "Saldi" ? t('themes.saldi') : "";
		return (
			<div key={theme} className="p-col-12">
				<RadioButton inputId={theme} name="theme" value={theme} onChange={(e) => this.props.basedata.setTheme(e.value)} checked={this.props.basedata.getTheme() === theme} />
				<label htmlFor={theme} className="p-radiobutton-label">{themeLabel}</label>

			</div>
		);
	}

	private makeRadioButton(id: string, label: string): JSX.Element {
		return (
			<div key={id} className="p-col-12">
				<RadioButton inputId={id} name="data" value={id} onChange={(e) => this.props.basedata.setDataProcessing(e.value)} checked={this.props.basedata.getDataProcessing() === id} />
				<label htmlFor={id} className="p-radiobutton-label">{label}</label>
			</div>
		);
	}

}
export default withNamespaces()(Themes);
