import BaseData from "../../data/BaseData";

import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import R from "ramda";
import React, {MouseEvent} from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button } from 'primereact/button';
import Log from "../../log";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface IYearsProps extends WithNamespaces
{
	basedata: BaseData;
	availableYears: string[];
}

class Years extends React.Component<IYearsProps>
{

	constructor(props: IYearsProps)
	{
		super(props);
		this.onYearsChange = this.onYearsChange.bind(this);
		this.selectAllYears = this.selectAllYears.bind(this);
		this.unselectAllYears = this.unselectAllYears.bind(this);
		this.makeCheckBox = this.makeCheckBox.bind(this);
	}

	public render(): JSX.Element
	{
		const {t}:any = this.props ;
		const checkboxes = R.map(this.makeCheckBox, this.props.availableYears.sort());
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header={t('years.year')}>
					<Button onClick={this.selectAllYears} label={t('years.all')}/>
					<span> </span>
					<Button onClick={this.unselectAllYears} label={t('years.none')}/>
					<div className="p-grid" style={{ margin: "10px" }}>
						{checkboxes}
					</div>
				</AccordionTab>
			</Accordion>
		);
	}

	private makeCheckBox(year: string)
	{
		return (
			<div key={year} className="p-col-12">
				<Checkbox inputId={year} value={year} onChange={this.onYearsChange} checked={R.includes(year, this.props.basedata.getYears())}></Checkbox>
				<label htmlFor="cb-{year}" className="p-checkbox-label">{year}</label>
			</div>
		);
	}

	private onYearsChange(e: { originalEvent: Event, value: string, checked: boolean})
	{
		let selectedYears = this.props.basedata.getYears();
		const selectedYear = e.value;
		if (e.checked)
		{
			selectedYears = R.append(selectedYear, selectedYears);
		}
		else
		{
			selectedYears = R.reject(R.equals(selectedYear), selectedYears);
		}
		const compare = function(a: string, b: string) { return a.localeCompare(b); };
		this.props.basedata.setYears(R.sort(compare, R.uniq(selectedYears)));
	}

	private selectAllYears(e: MouseEvent)
	{
		Log.debug("e: " + e);
		e.preventDefault();
		this.props.basedata.setYears(R.uniq(this.props.availableYears));
	}

	private unselectAllYears(e: MouseEvent)
	{
		Log.debug("e: " + e);
		e.preventDefault();
		let selectedYears : string[] = [];
		this.props.basedata.setYears(selectedYears);
	}

}
export default withNamespaces()(Years);
