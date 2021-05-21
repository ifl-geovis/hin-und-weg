import { Panel } from "primereact/panel";
import { RadioButton } from "primereact/radiobutton";
import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface IDataProcessingProps {
	selected: string;
	setDataProcessing: (data: string) => void;
}

export default class DataProcessingSelections extends React.Component<IDataProcessingProps> {

	constructor(props: IDataProcessingProps) {
		super(props);
		this.makeRadioButton = this.makeRadioButton.bind(this);
	}

	public render(): JSX.Element {
		const absolute = this.makeRadioButton("absolute", "Anzahl Umzüge");
		const wanderungsrate = this.makeRadioButton("wanderungsrate", "Wanderungsrate");
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Daten">
					{absolute}
					{wanderungsrate}
				</AccordionTab>
			</Accordion>
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