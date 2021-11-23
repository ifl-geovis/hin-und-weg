import { Panel } from "primereact/panel";
import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Checkbox } from "primereact/checkbox";
import SelectInput from "../input/SelectInput";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface ILocationProps extends WithNamespaces
{
	title: string;
	locations: string[];
	selectedLocation: string | null;
	onSelectLocation: (newLocation: string) => void;
	migrationsInside: boolean;
	setMigrationsInside: (on: boolean) => void;
}

// export default 
class Location extends React.Component<ILocationProps>
{

	constructor(props: ILocationProps)
	{
		super(props);
		this.onMigrationsInsideChange = this.onMigrationsInsideChange.bind(this);
	}

	public render(): JSX.Element
	{
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header={this.props.title}>
					<SelectInput options={this.props.locations} selected={this.props.selectedLocation} onSelected={this.props.onSelectLocation}/>
					<div className="p-col-12">
						<Checkbox inputId="migrationsInside" value="migrationsInside" onChange={this.onMigrationsInsideChange} checked={this.props.migrationsInside}></Checkbox>
						<label htmlFor="migrationsInside" className="p-checkbox-label">Umzüge innerhalb der Fläche berücksichtigen</label>
						{/* <label htmlFor="migrationsInside" className="p-checkbox-label">Umzüge innerhalb der Fläche berücksichtigen</label> */}
					</div>
				</AccordionTab>
			</Accordion>
		);
	}

	private onMigrationsInsideChange(e: { originalEvent: Event, value: string, checked: boolean}) {
		this.props.setMigrationsInside(e.checked);
	}

}
export default withNamespaces()(Location);
