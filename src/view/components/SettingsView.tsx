import * as React from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ColorPicker } from 'primereact/colorpicker';
import { Button } from 'primereact/button';

import Settings from '../../settings';
import OfflineMaps from '../../data/OfflineMaps';

export interface ISettingsProps {}

interface ISettingsState {
	change: boolean;
}

export default class SettingsView extends React.Component<ISettingsProps, ISettingsState> {
	private legendPlacementSelections = [
		{ label: 'Unter der Karte', value: 'bottom' },
		{ label: 'Über der Karte', value: 'top' },
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
		const map = this.getMapSettings();
		const colorschemes = this.getColorSchemes();
		return (
			<TabView className="p-tabview-right" activeIndex={0}>
				<TabPanel header="Karte">{map}</TabPanel>
				<TabPanel header="Farbschemata">{colorschemes}</TabPanel>
			</TabView>
		);
	}

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

	private getColorSchemes() {
		const scheme1 = this.getColorSchemePickers('scheme1');
		const scheme2 = this.getColorSchemePickers('scheme2');
		return (
			<div>
				<h1>benutzerdefinierte Farbschemata</h1>
				<h2>Schema 1</h2>
				{scheme1}
				<h2>Schema 2</h2>
				{scheme2}
				<Button label="Speichern" onClick={this.saveSettings} style={{ marginTop: '2em' }} />
			</div>
		);
	}

	private getColorSchemePickers(basename: string) {
		const color1 = this.createColorPicker('user-color-schemes', basename + '-color1');
		const color2 = this.createColorPicker('user-color-schemes', basename + '-color2');
		const color3 = this.createColorPicker('user-color-schemes', basename + '-color3');
		const color4 = this.createColorPicker('user-color-schemes', basename + '-color4');
		const color5 = this.createColorPicker('user-color-schemes', basename + '-color5');
		const color6 = this.createColorPicker('user-color-schemes', basename + '-color6');
		const color7 = this.createColorPicker('user-color-schemes', basename + '-color7');
		const color8 = this.createColorPicker('user-color-schemes', basename + '-color8');
		const color9 = this.createColorPicker('user-color-schemes', basename + '-color9');
		return (
			<div>
				{color1}
				{color2}
				{color3}
				{color4}
				{color5}
				{color6}
				{color7}
				{color8}
				{color9}
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

	private createColorPicker(section: string, key: string) {
		return (
			<ColorPicker
				id={'colorpicker-' + section + '-' + key}
				value={Settings.getValue(section, key)}
				onChange={(e) => this.processInput(section, key, e)}
			/>
		);
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
