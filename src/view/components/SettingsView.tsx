import * as React from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';
import ColorPick from '../input/ColorPick';

import Settings from '../../settings';
import OfflineMaps from '../../data/OfflineMaps';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface ISettingsProps extends WithNamespaces{
	change: () => void;
}

interface ISettingsState {
	change: boolean;
	activeTab: number;
}

// export default
class SettingsView extends React.Component<ISettingsProps, ISettingsState> {

	private legendPlacementSelections = [
		{ label: 'Unter der Karte', value: 'bottom' },
		{ label: 'Über der Karte', value: 'top' },
	];
	private styles = [
		{ label: 'Luna Amber', value: 'luna-amber' },
		{ label: 'Luna Blue', value: 'luna-blue' },
		{ label: 'Luna Green', value: 'luna-green' },
		{ label: 'Luna Pink', value: 'luna-pink' },
		{ label: 'Nova Colored', value: 'nova-colored' },
		{ label: 'Nova Dark', value: 'nova-dark' },
		{ label: 'Nova Light', value: 'nova-light' },
		{ label: 'Rhea', value: 'rhea' },
	];
	private colorSchemeDefault = ['cc8844', 'bb8855', 'aa8866', '998877', '888888', '778899', '6688aa', '5588bb', '4488cc'];
	private classificationPositiveDefault = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	private classificationNegativeDefault = [-1, -2, -3, -4, -5, -6, -7, -8, -9];

	constructor(props: any, state: any) {
		super(props);
		this.state = {
			change: true,
			activeTab: 0,
		};
		this.processInput = this.processInput.bind(this);
		this.saveSettings = this.saveSettings.bind(this);
		this.refreshOfflineMapsCheck = this.refreshOfflineMapsCheck.bind(this);
		this.setArrowColor = this.setArrowColor.bind(this);
		OfflineMaps.getCurrentOfflineMaps().readOfflineMapsFile();
	}

	public render(): JSX.Element {
		const {t}:any = this.props ;
		const map = this.getMapSettings();
		const colorschemes = this.getColorSchemes();
		const classification = this.getClassification();
		const styles = this.getStyles();
		return (
			<TabView className="p-tabview-right" activeIndex={this.state.activeTab} onTabChange={(e) => this.tabChanged(e)}>
				<TabPanel header={t('settings.map')}>{map}</TabPanel>
				<TabPanel header={t('settings.colors')}>{colorschemes}</TabPanel>
				<TabPanel header={t('settings.classes')}>{classification}</TabPanel>
				<TabPanel header={t('settings.styles')}>{styles}</TabPanel>
			</TabView>
		);
	}

	// Da nun onTabChange definiert ist, werden die jeweiligen Start-Funktionen (bspw. this.getMapSettings()) der einzelnen Tabs
	// beim Wechsel aufgerufen
	private tabChanged(e: any) {
		// console.log('tabChanged', e);
		this.setState({ activeTab: e.index });
	}

	private getMapSettings() {
		const {t}:any = this.props ;
		const legendPlacementSelectionsTranslated = [
			{ label: t('settings.underMap'), value: 'bottom' },
			{ label: t('settings.aboveMap'), value: 'top' },
		];
		OfflineMaps.getCurrentOfflineMaps().readOfflineMapsFile();
		const dropdownLegendPlacement = this.createDropdownInput(
			t('settings.legendPlacement'),
			// 'Platzierung der Legende: ',
			'map',
			'legendPlacement',
			legendPlacementSelectionsTranslated
			// this.legendPlacementSelections
		);
		let positivePicker = this.getPicker(true);
		let negativePicker = this.getPicker(false);
		return (
			<div>
				<h1>{t('settings.map')}</h1>
				{/* <h1>Karte</h1> */}
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<h4 style={{ marginRight: '1em' }}>{t('settings.offlineFolder')}</h4>
					<span style={{ wordBreak: 'break-word' }}>{Settings.getValue('map', 'offlinePath')}</span>
					<label htmlFor="selectDirectory" className="customSelectDirectory" style={{ marginLeft: '1.5em' }}>
						<i className="pi pi-folder-open" style={{ fontSize: '1.5em' }}></i>
						<span>{t('settings.changeFolder')}</span>
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
				{t('settings.offlineImported1')} {OfflineMaps.getCurrentOfflineMaps().getData().length - 1} {t('settings.offlineImported2')}
				</p>
				<div className={`offlineMapHintError ${OfflineMaps.getCurrentOfflineMaps().getMissingImageFiles().length && 'show'} }`}>
					<p>
					{t('settings.missingOffline')}{' '}
						{OfflineMaps.getCurrentOfflineMaps().getMissingImageFiles().join(', ')}
					</p>

					<Button
						label={t('settings.checkFolder')}
						// label="Ordner erneut prüfen ..."
						onClick={this.refreshOfflineMapsCheck}
						className="p-button-danger p-button-rounded p-button-sm btnRefreshOfflineMaps"
					/>
				</div>
				<hr style={{ margin: '2em 0' }} />
				{dropdownLegendPlacement}
				<hr style={{ margin: '2em 0' }} />
				{positivePicker}
				{negativePicker}
				<Button label={t('settings.save')} onClick={this.saveSettings} style={{ marginTop: '2em' }} />
			</div>
		);
	}

	private getPicker(positive: boolean) {
		const {t}:any = this.props ;
		const label = (positive) ? t('settings.arrowsFrom') : t('settings.arrowsTo') ;
		const id = (positive) ? 'positiveArrowColor' : 'negativeArrowColor';
		const value = (positive) ? Settings.getValue('user-colors', 'arrow-positive-color') : Settings.getValue('user-colors', 'arrow-negative-color');
		return (
			<div>
				<div>{label}</div>
				<ColorPick id={id} value={value} onChange={(event) => this.setArrowColor(positive, event.target.value)} />
			</div>
		);
	}

	private setArrowColor(positive: boolean, value: string) {
		let color = value;
		if ((value != null) && (value.startsWith("#"))) color = value.substring(1);
		if (positive) Settings.setValue('user-colors', 'arrow-positive-color', color);
		else Settings.setValue('user-colors', 'arrow-negative-color', color);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}

	private getColorSchemes() {
		const {t}:any = this.props ;
		const scheme1 = this.getColorSchemePickers('scheme1');
		const scheme2 = this.getColorSchemePickers('scheme2');
		const scheme3 = this.getColorSchemePickers('scheme3');
		const scheme4 = this.getColorSchemePickers('scheme4');
		const scheme5 = this.getColorSchemePickers('scheme5');
		const scheme6 = this.getColorSchemePickers('scheme6');
		const neutralcolor = Settings.getValue('user-colors', 'neutral-color');
		const missingcolor = Settings.getValue('user-colors', 'missing-color');
		return (
			<div>
				<h1>{t('settings.colorsUser')}</h1>
				<h2>{t('settings.colorsSpecial')}</h2>
				<div>
					<ColorPick
						id={'colorpicker-neutral'}
						value={neutralcolor}
						onChange={(e) => this.processSpecialColorInput('user-colors', 'neutral-color', e)}
					/>
					&nbsp;{t('settings.colorNeutral')}
				</div>
				<div>
					<ColorPick
						id={'colorpicker-missing'}
						value={missingcolor}
						onChange={(e) => this.processSpecialColorInput('user-colors', 'missing-color', e)}
					/>
					&nbsp;{t('settings.colorNaN')}
				</div>
				<h2>{t('settings.scheme')} 1</h2>
				{scheme1}
				<h2>{t('settings.scheme')} 2</h2>
				{scheme2}
				<h2>{t('settings.scheme')} 3</h2>
				{scheme3}
				<h2>{t('settings.scheme')} 4</h2>
				{scheme4}
				<h2>{t('settings.scheme')} 5</h2>
				{scheme5}
				<h2>{t('settings.scheme')} 6</h2>
				{scheme6}
				<Button label={t('settings.save')} onClick={this.saveSettings} style={{ marginTop: '2em' }} />
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
		const {t}:any = this.props ;
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
				<h1>{t('settings.classesUser')}</h1>
				<div>{t('settings.classesUser2')}</div>
				<h2>{t('settings.positiveValues')}</h2>
				{inputpositive1}
				{inputpositive2}
				{inputpositive3}
				{inputpositive4}
				{inputpositive5}
				{inputpositive6}
				{inputpositive7}
				{inputpositive8}
				<h2>{t('settings.negativeValues')}</h2>
				{inputnegative1}
				{inputnegative2}
				{inputnegative3}
				{inputnegative4}
				{inputnegative5}
				{inputnegative6}
				{inputnegative7}
				{inputnegative8}
				<div>
					<Button label={t('settings.save')} onClick={this.saveSettings} style={{ marginTop: '2em' }} />
				</div>
			</div>
		);
	}

	private selectOfflinePath(files: any) {
		const name = files[0].name;
		const path = files[0].path.slice(0, -name.length);
		Settings.setValue('map', 'offlinePath', path);
		Settings.setValue('map', 'offlineConfigFile', name);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
		OfflineMaps.getCurrentOfflineMaps().readOfflineMapsFile();
	}

	private refreshOfflineMapsCheck() {
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
			<ColorPick
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
		let color = value;
		if ((value != null) && (value.startsWith("#"))) color = value.substring(1);
		let scheme = Settings.getValue(section, key);
		if (scheme == null) scheme = this.colorSchemeDefault;
		scheme[index] = color;
		Settings.setValue(section, key, scheme);
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}

	private processSpecialColorInput(section: string, key: string, event: any) {
		// @ts-ignore
		const value = event.target.value;
		let color = value;
		if ((value != null) && (value.startsWith("#"))) color = value.substring(1);
		Settings.setValue(section, key, color);
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
		//Settings.save();
		this.setState({ change: this.state.change ? false : true });
	}

	private saveSettings() {
		this.checkClassificationBorders();
		Settings.save();
		this.setState({ change: this.state.change ? false : true });
		this.props.change();
	}

	private checkClassificationBorders() {
		// positive
		let positive = Settings.getValue('classification', 'positive');
		let last = 0;
		if (!positive) positive = this.classificationPositiveDefault;
		for (let i = 0; i < 10; i++) {
			let current = parseFloat(positive[i]);
			if (isNaN(current) || current <= last) current = last + 1;
			last = current;
			positive[i] = current;
		}
		Settings.setValue('classification', 'positive', positive);
		// negative
		let negative = Settings.getValue('classification', 'negative');
		last = 0;
		if (!negative) negative = this.classificationNegativeDefault;
		for (let i = 0; i < 10; i++) {
			let current = parseFloat(negative[i]);
			if (isNaN(current) || current >= last) current = last - 1;
			last = current;
			negative[i] = current;
		}
		Settings.setValue('classification', 'negative', negative);
	}

	private getStyles() {
		const {t}:any = this.props ;
		const dropdownStyles = this.createDropdownInput(
			t('settings.style'),
			// 'Style: ',
			'global',
			'style',
			this.styles
		);
		return (
			<div>
				<h1>{t('settings.styles')}</h1>
				<div>{t('settings.stylesNote')}</div>
				{dropdownStyles}
				<Button label={t('settings.save')} onClick={this.saveSettings} style={{ marginTop: '2em' }} />
			</div>
		);
	}

}
export default withNamespaces()(SettingsView);
