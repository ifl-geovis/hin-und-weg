import * as React from "react";
import { TabPanel, TabView } from "primereact/tabview";
import { Dropdown } from "primereact/dropdown";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

import Config from "../../config";
import Settings from "../../settings";

export interface ISettingsProps {
}

interface ISettingsState {
	change: boolean;
}

export default class SettingsView extends React.Component<ISettingsProps, ISettingsState>
{

	private test1selections = [
		{label: "Wert 1", value: "value1"},
		{label: "schlechter Wert", value: "value2"},
		{label: "guter Wert", value: "value3"},
	];

	constructor(props: any, state: any)
	{
		super(props);
		this.state = {
			change: true,
		};
		this.processInput = this.processInput.bind(this);
		this.saveSettings = this.saveSettings.bind(this);
	}

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
		const textinput1 = this.createTextInput('Textinput 1 für Test 1', 'test1', 'textinput1');
		const textinput2 = this.createTextInput('Textinput 2 für Test 1', 'test1', 'textinput2');
		return (
			<div className="p-grid">
				<div className="p-col-12">
					<h3>Dropdown Test 1</h3>
				</div>
				<div className="p-col-12">
					<Dropdown optionLabel="label" value={'value3'} options={this.test1selections} onChange={this.processTest1} style={{width: "100%"}}/>
				</div>
				<div className="p-col-12">
					{textinput1}
					{textinput2}
					<Button label="Speichern" onClick={this.saveSettings} />
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

	private createTextInput(label: string, section: string, key: string)
	{
		return (
			<div className="p-grid">
				<div className="p-col-12">
					<h3>{label}</h3>
				</div>
				<div className="p-col-12">
					<InputText id={section + '-' + key} value={Settings.getValue(section, key)} onChange={(e) => this.processInput(section, key, e)} style={{width: "100%"}}/>
				</div>
			</div>
		);
	}

	private processTest1(event: { originalEvent: Event, value: any}) {
		//this.props.setAlgorithm(event.value.value);
	}

	private processInput(section: string, key: string, event: any) {
		// @ts-ignore
		const value = event.target.value;
		Settings.setValue(section, key, value);
		Settings.save();
		this.setState({ change: (this.state.change) ? false : true });
	}

	private saveSettings() {
		Settings.save();
		this.setState({ change: (this.state.change) ? false : true });
	}

}