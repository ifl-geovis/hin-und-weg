import { Panel } from "primereact/panel";
import { Checkbox } from "primereact/checkbox";
import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';

export interface IOptionProps {
	migrationsInside: boolean;
	setMigrationsInside: (on: boolean) => void;
}

export default class OptionSelections extends React.Component<IOptionProps> {

	constructor(props: IOptionProps) {
		super(props);
		this.onMigrationsInsideChange = this.onMigrationsInsideChange.bind(this);
	}

	public render(): JSX.Element {
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Optionen">
					<div className="p-col-12">
						<Checkbox inputId="migrationsInside" value="migrationsInside" onChange={this.onMigrationsInsideChange} checked={this.props.migrationsInside}></Checkbox>
						<label htmlFor="migrationsInside" className="p-checkbox-label">Umzüge innerhalb einer Fläche berücksichtigen</label>
					</div>
				</AccordionTab>
			</Accordion>
		);
	}

	private onMigrationsInsideChange(e: { originalEvent: Event, value: string, checked: boolean}) {
		this.props.setMigrationsInside(e.checked);
	}

}