import BaseData from "../../data/BaseData";

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
	basedata: BaseData;
	title: string;
	locations: string[];
}

class Location extends React.Component<ILocationProps>
{

	constructor(props: ILocationProps)
	{
		super(props);
		this.onMigrationsInsideChange = this.onMigrationsInsideChange.bind(this);
	}

	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header={this.props.title}>
					<SelectInput options={this.props.locations} selected={this.props.basedata.getLocation()} onSelected={(newlocation) => this.props.basedata.setLocation(newlocation)}/>
					<div className="p-col-12">
						<Checkbox inputId="migrationsInside" value="migrationsInside" onChange={this.onMigrationsInsideChange} checked={this.props.basedata.getMigrationsInside()}></Checkbox>
						<label htmlFor="migrationsInside" className="p-checkbox-label">{t('location.insideMigration')}</label>
					</div>
				</AccordionTab>
			</Accordion>
		);
	}

	private onMigrationsInsideChange(e: { originalEvent: Event, value: string, checked: boolean}) {
		this.props.basedata.setMigrationsInside(e.checked);
	}

}
export default withNamespaces()(Location);
