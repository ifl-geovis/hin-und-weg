import * as React from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { ColorPicker } from 'primereact/colorpicker';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';

import Settings from '../../settings';
import OfflineMaps from '../../data/OfflineMaps';

export interface ISettingsProps {
	change: () => void;
}

interface ISettingsState {
	change: boolean;
}

export default class SettingsView extends React.Component<ISettingsProps, ISettingsState> {
	private legendPlacementSelections = [
		{ label: 'Unter der Karte', value: 'bottom' },
		{ label: 'Über der Karte', value: 'top' },
	];
	private colorSchemeDefault = ['cc8844', 'bb8855', 'aa8866', '998877', '888888', '778899', '6688aa', '5588bb', '4488cc'];
	private classificationPositiveDefault = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	private classificationNegativeDefault = [-1, -2, -3, -4, -5, -6, -7, -8, -9];

	constructor(props: any, state: any) {
		super(props);
		this.state = {
			change: true,
		};
		this.processInput = this.processInput.bind(this);
		this.saveSettings = this.saveSettings.bind(this);
		OfflineMaps.getCurrentOfflineMaps().readOfflineMapsFile();
	}

	public render(): JSX.Element {
		const map = this.getMapSettings();
		const colorschemes = this.getColorSchemes();
		const classification = this.getClassification();
		return (
			<TabView className="p-tabview-right" activeIndex={0}>
				<TabPanel header="Karte">{map}</TabPanel>
				<TabPanel header="Farben">{colorschemes}</TabPanel>
				<TabPanel header="Klassen">{classification}</TabPanel>
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
					<h4 style={{ marginRight: '1em' }}>Ordner für Offline Karten:</h4>
					<span style={{ wordBreak: 'break-word' }}>{Settings.getValue('map', 'offlinePath')}</span>
					<label htmlFor="selectDirectory" className="customSelectDirectory" style={{ marginLeft: '1.5em' }}>
						<i className="pi pi-folder-open" style={{ fontSize: '1.5em' }}></i>
						<span>Ordner ändern</span>
					</label>
					<input
						style={{ marginBottom: '1em' }}
						id="selectDirectory"
						className="p-mb-2"
						type="file"
						accept=".txt"
						onChange={(e) => this.selectOfflinePath(e.target.files)}
					/>
				</div>
				<p className="offlineMapHintSuccess">
					Es wurden {OfflineMaps.getCurrentOfflineMaps().getData().length - 1} OfflineKarten importiert.
				</p>
				<p className={`offlineMapHintError ${OfflineMaps.getCurrentOfflineMaps().getMissingImageFiles().length && 'show'} }`}>
					Fehlende Bilddateien, die in der Konfigurationsdatei angegeben sind:{' '}
					{OfflineMaps.getCurrentOfflineMaps().getMissingImageFiles().join(', ')}
				</p>
				<p className={`offlineMapHintError ${OfflineMaps.getCurrentOfflineMaps().getWrongCoordinates().length && 'show'} }`}>
					Die Koordinaten der folgenden Bilder scheinen falsch zu sein:
					{OfflineMaps.getCurrentOfflineMaps().getWrongCoordinates().join(', ')} <br />
					Die Koordinaten müssen in WGS84 angegeben werden.
					<br /> Maximale Ausdehnung für Deutschland: <br />
					Latitude: {OfflineMaps.getCurrentOfflineMaps().latBounds.min} / {OfflineMaps.getCurrentOfflineMaps().latBounds.max}
					<br />
					Longitude: {OfflineMaps.getCurrentOfflineMaps().lonBounds.min} / {OfflineMaps.getCurrentOfflineMaps().lonBounds.max}
				</p>
				{dropdownLegendPlacement}
				<Button label="Speichern" onClick={this.saveSettings} style={{ marginTop: '2em' }} />
			</div>
		);
	}

	private getColorSchemes() {
		const scheme1 = this.getColorSchemePickers('scheme1');
		const scheme2 = this.getColorSchemePickers('scheme2');
		const scheme3 = this.getColorSchemePickers('scheme3');
		const scheme4 = this.getColorSchemePickers('scheme4');
		const scheme5 = this.getColorSchemePickers('scheme5');
		const scheme6 = this.getColorSchemePickers('scheme6');
		return (
			<div>
				<h1>benutzerdefinierte Farbschemata</h1>
				<h2>Schema 1</h2>
				{scheme1}
				<h2>Schema 2</h2>
				{scheme2}
				<h2>Schema 3</h2>
				{scheme3}
				<h2>Schema 4</h2>
				{scheme4}
				<h2>Schema 5</h2>
				{scheme5}
				<h2>Schema 6</h2>
				{scheme6}
				<Button label="Speichern" onClick={this.saveSettings} style={{ marginTop: '2em' }} />
			</div>
		);
	}

	private getColorSchemePickers(basename: string) {
		const color1 = this.createColorPicker('user-color-schemes', basename, 0);
		const color2 = this.createColorPicker('user-color-schemes', basename, 1);
		const color3 = this.createColorPicker('user-color-schemes', basename, 2);
		const color4 = this.createColorPicker('user-color-schemes', basename, 3);
		const color5 = this.createColorPicker('user-color-schemes', basename, 4);
		const color6 = this.createColorPicker('user-color-schemes', basename, 5);
		const color7 = this.createColorPicker('user-color-schemes', basename, 6);
		const color8 = this.createColorPicker('user-color-schemes', basename, 7);
		const color9 = this.createColorPicker('user-color-schemes', basename, 8);
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

	private getClassification() {
		const inputpositive1 = this.createClassificationInput('classification', 'positive', 0, true);
		const inputpositive2 = this.createClassificationInput('classification', 'positive', 1, true);
		const inputpositive3 = this.createClassificationInput('classification', 'positive', 2, true);
		const inputpositive4 = this.createClassificationInput('classification', 'positive', 3, true);
		const inputpositive5 = this.createClassificationInput('classification', 'positive', 4, true);
		const inputpositive6 = this.createClassificationInput('classification', 'positive', 5, true);
		const inputpositive7 = this.createClassificationInput('classification', 'positive', 6, true);
		const inputpositive8 = this.createClassificationInput('classification', 'positive', 7, true);
		const inputnegative1 = this.createClassificationInput('classification', 'negative', 0, false);
		const inputnegative2 = this.createClassificationInput('classification', 'negative', 1, false);
		const inputnegative3 = this.createClassificationInput('classification', 'negative', 2, false);
		const inputnegative4 = this.createClassificationInput('classification', 'negative', 3, false);
		const inputnegative5 = this.createClassificationInput('classification', 'negative', 4, false);
		const inputnegative6 = this.createClassificationInput('classification', 'negative', 5, false);
		const inputnegative7 = this.createClassificationInput('classification', 'negative', 6, false);
		const inputnegative8 = this.createClassificationInput('classification', 'negative', 7, false);
		return (
			<div>
				<h1>benutzerdefinierte Klassengrenzen</h1>
				<h2>positive Werte</h2>
				{inputpositive1}
				{inputpositive2}
				{inputpositive3}
				{inputpositive4}
				{inputpositive5}
				{inputpositive6}
				{inputpositive7}
				{inputpositive8}
				<h2>negative Werte</h2>
				{inputnegative1}
				{inputnegative2}
				{inputnegative3}
				{inputnegative4}
				{inputnegative5}
				{inputnegative6}
				{inputnegative7}
				{inputnegative8}
				<div>
					<Button label="Speichern" onClick={this.saveSettings} style={{ marginTop: '2em' }} />
				</div>
			</div>
		);
	}

	selectOfflinePath(files: any) {
		const name = files[0].name;
		const path = files[0].path.slice(0, -name.length);
		Settings.setValue('map', 'offlinePath', path);
		Settings.setValue('map', 'offlineConfigFile', name);
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

	private createColorPicker(section: string, key: string, index: number) {
		let scheme = Settings.getValue(section, key);
		if (scheme == null) scheme = this.colorSchemeDefault;
		return (
			<ColorPicker
				id={'colorpicker-' + key + '-color' + index}
				value={scheme[index]}
				onChange={(e) => this.processColorInput(section, key, e, index)}
			/>
		);
	}

	private createClassificationInput(section: string, key: string, index: number, positive: boolean) {
		let classification = Settings.getValue(section, key);
		const defs = positive ? this.classificationPositiveDefault : this.classificationNegativeDefault;
		if (classification == null) classification = defs;
		let value = classification[index];
		return (
			<InputText
				id={'classification-' + section + '-' + key + '-' + index}
				value={value}
				onChange={(e) => this.processClassificationInput(section, key, e, index, defs)}
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

	private processColorInput(section: string, key: string, event: any, index: number) {
		// @ts-ignore
		const value = event.target.value;
		let scheme = Settings.getValue(section, key);
		if (scheme == null) scheme = this.colorSchemeDefault;
		scheme[index] = value;
		Settings.setValue(section, key, scheme);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}

	private processClassificationInput(section: string, key: string, event: any, index: number, defs: number[]) {
		// @ts-ignore
		let value = event.currentTarget.value;
		let classification = Settings.getValue(section, key);
		if (classification == null) classification = defs;
		classification[index] = value;
		Settings.setValue(section, key, classification);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}

	private saveSettings() {
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
		this.props.change();
	}
}
