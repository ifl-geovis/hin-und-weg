import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import {ColorPicker} from 'primereact/colorpicker';

import Config from "../../config";

export interface IArrowColorSelectionsProps
{
	positiveColor: string;
	negativeColor: string;
	setPositiveColor: (event: any) => void;
	setNegativeColor: (event: any) => void;
	withNegative: boolean;
}

export default class ArrowColorSelections extends React.Component<IArrowColorSelectionsProps>
{

	constructor(props: IArrowColorSelectionsProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		const positivePicker = this.getPicker(true);
		let negativePicker;
		if (this.props.withNegative) negativePicker = this.getPicker(false);
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Pfeilfarbe">
					{positivePicker}
					{negativePicker}
				</AccordionTab>
			</Accordion>
		);
	}

	private getPicker(positive: boolean) {
		let label = 'Pfeilfarbe';
		if (this.props.withNegative) label = (positive) ? 'Pfeilfarbe positive Werte' : 'Pfeilfarbe negative Werte';
		const id = (positive) ? 'positiveArrowColor' : 'negativeArrowColor';
		return (
			<div>
				<div>{label}</div>
				<ColorPicker id={id} value={(positive) ? this.props.positiveColor : this.props.negativeColor} onChange={(positive) ? this.props.setPositiveColor : this.props.setNegativeColor} />
			</div>
		);
	}

}