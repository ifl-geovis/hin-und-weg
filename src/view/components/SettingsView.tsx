import * as React from "react";
import { TabPanel, TabView } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";

import Config from "../../config";

export default class SettingsView extends React.Component<{}, {}>
{

	private test1selections = [
		{label: "Wert 1", value: "value1"},
		{label: "schlechter Wert", value: "value2"},
		{label: "guter Wert", value: "value3"},
	];

	public render(): JSX.Element {
		const test1 = this.getTest1();
		const test2 = this.getTest2();
		return (
			<TabView className="p-tabview-right" activeIndex={0}>
				<TabPanel header="Test 1">
					{test1}
				</TabPanel>
				<TabPanel header="Test 2">
					{test2}
				</TabPanel>
			</TabView>
		);
	}

	private getTest1() {
		return (
			<div className="p-grid">
				<div className="p-col-12">
					<Dropdown optionLabel="label" value={'value3'} options={this.test1selections} onChange={this.processTest1} style={{width: "100%"}}/>
				</div>
			</div>
		);
	}

	private getTest2() {
		return (
			<div className="p-grid">
				<div className="p-col-12">
					<h1>Test 2</h1>
				</div>
			</div>
		);
	}

	private processTest1(event: { originalEvent: Event, value: any}) {
		//this.props.setAlgorithm(event.value.value);
	}

}