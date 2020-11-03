import * as React from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import Settings from '../../settings';
import OfflineMaps from '../../data/OfflineMaps';

export interface ISettingsProps {}

interface ISettingsState {
	change: boolean;
}

export default class SettingsView extends React.Component<ISettingsProps, ISettingsState> {
	private legendPlacementSelections = [
		{ label: 'Unten', value: 'bottom' },
		{ label: 'Oben', value: 'top' },
	];

	constructor(props: any, state: any) {
		super(props);
		this.state = {
			change: true,
		};
		this.processInput = this.processInput.bind(this);
		this.saveSettings = this.saveSettings.bind(this);
	}

	public render(): JSX.Element {
		// const test1 = this.getTest1();
		// const test2 = this.getTest2();
		const map = this.getMapSettings();
		return (
			<TabView className="p-tabview-right" activeIndex={0}>
				<TabPanel header="Karte">{map}</TabPanel>
			</TabView>
		);
	}

	// private getTest1() {
	// 	const dropdowninput1 = this.createDropdownInput('Dropdowninput 1 für Test 1', 'test1', 'dropdowninput1', this.test1selections);
	// 	const textinput1 = this.createTextInput('Textinput 1 für Test 1', 'test1', 'textinput1');
	// 	const textinput2 = this.createTextInput('Textinput 2 für Test 1', 'test1', 'textinput2');
	// 	return (
	// 		<div className="p-grid">
	// 			<div className="p-col-12">
	// 				{dropdowninput1}
	// 				{textinput1}
	// 				{textinput2}
	// 				<Button label="Speichern" onClick={this.saveSettings} />
	// 			</div>
	// 		</div>
	// 	);
	// }

	// private getTest2() {
	// 	return (
	// 		<div className="p-grid">
	// 			<div className="p-col-12">
	// 				<h1>Test 2</h1>
	// 			</div>
	// 		</div>
	// 	);
	// }

	private getMapSettings() {
		const dropdownLegendPlacement = this.createDropdownInput(
			'Platzierung der Legende: ',
			'map',
			'legendPlacement',
			this.legendPlacementSelections
		);
		return (
			<div>
				<h1>Karte</h1>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<h4 style={{ marginRight: '1em' }}>Ordner für Offline Karten:</h4> {Settings.getValue('map', 'offlinePath')}
					<label htmlFor="selectDirectory" className="customSelectDirectory" style={{ marginLeft: '1.5em' }}>
						<i className="pi pi-folder-open" style={{ fontSize: '1.5em' }}></i>
						<span>Ordner ändern</span>
					</label>
					<input
						style={{ marginBottom: '1em' }}
						id="selectDirectory"
						className="p-mb-2"
						type="file"
						// @ts-ignore
						directory=""
						// @ts-ignore
						webkitdirectory=""
						onChange={(e) => this.selectOfflinePath(e.target.files)}
					/>
				</div>
				<p className={`offlineMapHint ${OfflineMaps.getCurrentOfflineMaps().getMissingOfflineTxt() && 'show'}`}>
					Offline Karten konnten nicht geladen werden!
				</p>
				{dropdownLegendPlacement}
				<Button label="Speichern" onClick={this.saveSettings} style={{ marginTop: '2em' }} />
			</div>
		);
	}

	selectOfflinePath(files: any) {
		const path = files[0].path;
		Settings.setValue('map', 'offlinePath', path);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
		OfflineMaps.getCurrentOfflineMaps().readOfflineMapsFile();
	}

	private createDropdownInput(label: string, section: string, key: string, selections: any) {
		return (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<h4 style={{ marginRight: '1em', whiteSpace: 'nowrap' }}>{label}</h4>
				<Dropdown
					id={section + '-' + key}
					value={Settings.getValue(section, key)}
					options={selections}
					onChange={(e) => this.processInput(section, key, e)}
					style={{ width: '100%' }}
				/>
			</div>
		);
	}

	private createTextInput(label: string, section: string, key: string) {
		return (
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<h4 style={{ marginRight: '1em' }}>{label}</h4>
				<InputText
					id={section + '-' + key}
					value={Settings.getValue(section, key)}
					onChange={(e) => this.processInput(section, key, e)}
					style={{ width: '100%' }}
				/>
			</div>
		);
	}

	private processTest1(event: { originalEvent: Event; value: any }) {
		//this.props.setAlgorithm(event.value.value);
	}

	private processInput(section: string, key: string, event: any) {
		// @ts-ignore
		const value = event.target.value;
		Settings.setValue(section, key, value);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}

	private saveSettings() {
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}
}
