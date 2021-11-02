import { Panel } from "primereact/panel";
import { RadioButton } from "primereact/radiobutton";
import R from "ramda";
import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface IThemesProps {
	selectedTheme: string;
	setTheme: (theme: string) => void;
	themes: string[];
	selected: string;
	setDataProcessing: (data: string) => void;
	populationDataLoaded: boolean;
}

export default class Themes extends React.Component<IThemesProps> {

	constructor(props: IThemesProps) {
		super(props);
		this.makeRadioButton = this.makeRadioButton.bind(this);
		this.makeRadioButtonTheme = this.makeRadioButtonTheme.bind(this);
	}

	public render(): JSX.Element {
		const radioButtons = R.map(this.makeRadioButtonTheme, this.props.themes);
		const wanderungsselector = this.createWanderungsSelector();
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Thema">
					{radioButtons}
					{wanderungsselector}
				</AccordionTab>
			</Accordion>
		);
	}

	private createWanderungsSelector(): JSX.Element {
		if (!this.props.populationDataLoaded) return (<span></span>);
		const absolute = this.makeRadioButton("absolute", "Anzahl Umzüge");
		const wanderungsrate = (this.props.selectedTheme === 'Saldi') ? this.makeRadioButton("wanderungsrate", "Wanderungsrate") : (<span></span>);
		const ratevon = (this.props.selectedTheme != 'Saldi') ? this.makeRadioButton("ratevon", "Abwanderungsrate") : (<span></span>);
		const ratenach = (this.props.selectedTheme != 'Saldi') ? this.makeRadioButton("ratenach", "Zuzugsrate") : (<span></span>);
		return (
			<div>
				<hr />
				{absolute}
				{wanderungsrate}
				{ratevon}
				{ratenach}
			</div>
		);
	}

	private makeRadioButtonTheme(theme: string): JSX.Element {
		return (
			<div key={theme} className="p-col-12">
				<RadioButton inputId={theme} name="theme" value={theme}
							 onChange={(e) => this.props.setTheme(e.value)} checked={this.props.selectedTheme === theme} />
				<label htmlFor={theme} className="p-radiobutton-label">{theme}</label>
			</div>
		);
	}

	private makeRadioButton(id: string, label: string): JSX.Element {
		return (
			<div key={id} className="p-col-12">
				<RadioButton inputId={id} name="data" value={id} onChange={(e) => this.props.setDataProcessing(e.value)} checked={this.props.selected === id} />
				<label htmlFor={id} className="p-radiobutton-label">{label}</label>
			</div>
		);
	}

}
