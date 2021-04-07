import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import R from "ramda";
import React, {MouseEvent} from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import Log from "../log";

export interface IYearsProps
{
	availableYears: string[];
	selected: string[];
	setYears: (newYears: string[]) => void;
}

export default class Years extends React.Component<IYearsProps>
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
		const checkboxes = R.map(this.makeCheckBox, this.props.availableYears.sort());
		return (
			<Accordion activeIndex={0}>
				<AccordionTab header="Jahr(e)">
					<button onClick={this.selectAllYears}>alle auswählen…</button>
					<button onClick={this.unselectAllYears}>nichts auswählen…</button>
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
				<Checkbox inputId={year} value={year} onChange={this.onYearsChange} checked={R.includes(year, this.props.selected)}></Checkbox>
				<label htmlFor="cb-{year}" className="p-checkbox-label">{year}</label>
			</div>
		);
	}

	private onYearsChange(e: { originalEvent: Event, value: string, checked: boolean})
	{
		let selectedYears = this.props.selected;
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
		this.props.setYears(R.sort(compare, R.uniq(selectedYears)));
	}

	private selectAllYears(e: MouseEvent)
	{
		Log.debug("e: " + e);
		e.preventDefault();
		this.props.setYears(R.uniq(this.props.availableYears));
	}

	private unselectAllYears(e: MouseEvent)
	{
		Log.debug("e: " + e);
		e.preventDefault();
		let selectedYears : string[] = [];
		this.props.setYears(selectedYears);
	}

}