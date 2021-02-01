import React from 'react';
import Geodata from '../../model/Geodata';
import Legend from '../elements/Legend';
import LeafletMapView from './LeafletMapView';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Slider } from 'primereact/slider';
import Classification from '../../data/Classification';
import OfflineMaps, { IOfflineMaps } from '../../data/OfflineMaps';
import Settings from '../../settings';

export interface IGeodataProps {
	items?: Array<{ [name: string]: any }> | null;
	geodata: Geodata | null;
	geoName: string | null;
	locations: string[];
	selectedLocation?: string | null;
	yearsSelected: string[];
	onSelectLocation: (newLocation: string) => void;
	theme: string;
}

interface IGeodataState {
	showCenter: string;
	showMap: boolean;
	threshold: number;
	polygonTransparency: number;
	offlineMap: IOfflineMaps;
}

export default class GeodataView extends React.Component<IGeodataProps, IGeodataState> {
	constructor(props: IGeodataProps) {
		super(props);
		this.onShowCenterChange = this.onShowCenterChange.bind(this);
		this.onSliderChange = this.onSliderChange.bind(this);
		this.onTransparencySliderChange = this.onTransparencySliderChange.bind(this);
		this.onShowMapChange = this.onShowMapChange.bind(this);
		this.onOfflineMapChange = this.onOfflineMapChange.bind(this);
		this.state = {
			showCenter: '1',
			showMap: true,
			threshold: 0,
			polygonTransparency: 80,
			offlineMap: {
				label: 'Offline Map auswählen',
				file: '',
				bounds: [],
			},
		};
		OfflineMaps.getCurrentOfflineMaps().readOfflineMapsFile();
	}

	public render(): JSX.Element {
		// console.log('GeodataView render');
		const classification = Classification.getCurrentClassification();
		return (
			<div className="p-grid p-component">
				<div className="p-col noprint">
					<div className="p-grid p-dir-col">
						<strong className="p-col">Karteninformationen:</strong>
						<div className="p-col rdBtnContainer">
							<RadioButton
								inputId="rb1"
								name="center"
								value="1"
								onChange={this.onShowCenterChange}
								checked={this.state.showCenter === '1'}
							/>
							<label className="p-checkbox-label pointer" htmlFor="rb1">
								Namen anzeigen
							</label>
						</div>
						<div className="p-col rdBtnContainer">
							<RadioButton
								inputId="rb2"
								name="center"
								value="2"
								onChange={this.onShowCenterChange}
								checked={this.state.showCenter === '2'}
							/>
							<label className="p-checkbox-label pointer" htmlFor="rb2">
								Bewegung visualisieren
							</label>
						</div>
						<div className="p-col rdBtnContainer">
							<RadioButton
								inputId="rb3"
								name="center"
								value="3"
								onChange={this.onShowCenterChange}
								checked={this.state.showCenter === '3'}
							/>
							<label className="p-checkbox-label pointer" htmlFor="rb3">
								Anzahl der Umzüge anzeigen
							</label>
						</div>
						<div className="p-col rdBtnContainer">
							<label>Transparenz:</label>
							<Slider
								className="transparencySlider"
								min={0}
								max={100}
								step={1}
								value={this.state.polygonTransparency}
								orientation="horizontal"
								onChange={this.onTransparencySliderChange}
							/>
						</div>
					</div>
				</div>
				<div className="p-col noprint">
					<div className="p-grid p-dir-col">
						<strong className="p-col">Hintergrundkarte:</strong>
						<div className="p-col rdBtnContainer">
							<Checkbox inputId="showMap" value="showMap" onChange={this.onShowMapChange} checked={this.state.showMap}></Checkbox>
							<label className="p-checkbox-label pointer" htmlFor="showMap">
								zeige Hintergrundkarte (online)
							</label>
						</div>
						<div className="p-col">
							<Dropdown
								optionLabel="label"
								options={OfflineMaps.getCurrentOfflineMaps().getData()}
								onChange={this.onOfflineMapChange}
								placeholder={this.state.offlineMap.label}
								disabled={OfflineMaps.getCurrentOfflineMaps().getData().length - 1 === 0}
							/>
						</div>
					</div>
				</div>
				<div className={`p-col-12 mapSlider ${this.state.showCenter === '2' && 'show'}`}>
					<hr className={`noprint`} />
					<div className="p-grid p-align-center noprint">
						<p className="p-col-4">Es werden alle Pfeile mit einer bei Weg oder Zuzügen über {this.state.threshold} angezeigt.</p>
						<div className="p-col-8">
							<Slider
								min={0}
								max={classification.getMaxValue()}
								value={this.state.threshold}
								orientation="horizontal"
								onChange={this.onSliderChange}
							/>
						</div>
					</div>
				</div>
				{Settings.getValue('map', 'legendPlacement') === 'top' && (
					<div className="p-col-12">
						<Legend showCenter={this.state.showCenter} yearsSelected={this.props.yearsSelected} />
					</div>
				)}
				<div className="p-col-12">
					<LeafletMapView
						geodata={this.props.geodata}
						nameField={this.props.geoName}
						items={this.props.items}
						selectedLocation={this.props.selectedLocation}
						onSelectLocation={this.props.onSelectLocation}
						showCenter={this.state.showCenter}
						showMap={this.state.showMap}
						offlineMap={this.state.offlineMap}
						theme={this.props.theme}
						threshold={this.state.threshold}
						polygonTransparency={this.state.polygonTransparency}
					/>
				</div>
				{Settings.getValue('map', 'legendPlacement') === 'bottom' && (
					<div className="p-col-12">
						<Legend showCenter={this.state.showCenter} yearsSelected={this.props.yearsSelected} />
					</div>
				)}
			</div>
		);
	}

	private onShowCenterChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showCenter: e.value });
	}

	private onSliderChange(e: { originalEvent: Event; value: number }) {
		this.setState({ threshold: e.value as number });
	}
	private onTransparencySliderChange(e: { originalEvent: Event; value: number }) {
		this.setState({ polygonTransparency: e.value as number });
	}

	private onShowMapChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showMap: e.checked });
	}

	private onOfflineMapChange(e: { value: IOfflineMaps }) {
		this.setState({
			offlineMap: {
				label: e.value.label,
				file: e.value.file,
				bounds: e.value.bounds,
			},
		});
	}
}
