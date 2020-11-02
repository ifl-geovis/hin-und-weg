import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import {ColorPicker} from 'primereact/colorpicker';

import Config from "../../config";

export interface IArrowColorSelectionsProps
{
	theme: string;
	positiveColor: string;
	negativeColor: string;
	setPositiveColor: (event: any) => void;
	setNegativeColor: (event: any) => void;
}

export default class ArrowColorSelections extends React.Component<IArrowColorSelectionsProps>
{

	constructor(props: IArrowColorSelectionsProps)
	{
		super(props);
	}

	public render(): JSX.Element
	{
		let positivePicker;
		if (this.props.theme != 'Nach')  positivePicker = this.getPicker(true);
		let negativePicker;
		if (this.props.theme != 'Von') negativePicker = this.getPicker(false);
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
		if (this.props.theme == 'Saldi') label = (positive) ? 'Pfeilfarbe Von' : 'Pfeilfarbe Nach';
		const id = (positive) ? 'positiveArrowColor' : 'negativeArrowColor';
		return (
			<div>
				<div>{label}</div>
				<ColorPicker id={id} value={(positive) ? this.props.positiveColor : this.props.negativeColor} onChange={(positive) ? this.props.setPositiveColor : this.props.setNegativeColor} />
			</div>
		);
	}

}