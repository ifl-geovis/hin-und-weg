import React from 'react';
import Geodata from '../../model/Geodata';
import Legend from '../elements/Legend';
import LeafletMapView from './LeafletMapView';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import Config from '../../config';
import { Slider } from 'primereact/slider';
import { Class } from 'leaflet';
import Classification from '../../data/Classification';

export interface IGeodataProps {
	items?: Array<{ [name: string]: any }> | null;
	geodata: Geodata | null;
	geoName: string | null;
	locations: string[];
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	theme: string;
}

export interface IOfflineMaps {
	label: string;
	file: string;
	bounds: Array<Array<number>>;
}

interface IGeodataState {
	showCenter: String;
	showMap: boolean;
	offlineMap: IOfflineMaps;
	threshold: number;
}

const sliderStyle: React.CSSProperties = {
	margin: '5%',
	position: 'relative',
	width: '90%',
};

export default class GeodataView extends React.Component<IGeodataProps, IGeodataState> {
	constructor(props: IGeodataProps) {
		super(props);
		this.onShowCenterChange = this.onShowCenterChange.bind(this);
		this.onOfflineMapChange = this.onOfflineMapChange.bind(this);
		this.state = {
			showCenter: '1',
			showMap: true,
			threshold: 0,
			offlineMap: {
				label: 'Offline Map auswählen',
				file: '',
				bounds: [],
			},
		};
	}

	public render(): JSX.Element {
		console.log('render von geodataview', Config.getValue('offline', 'maps'));

		const classification = Classification.getCurrentClassification();

		return (
			<div className="p-grid">
				<div className="p-col-12">
					Namen anzeigen:{' '}
					<RadioButton
						inputId="rb1"
						name="center"
						value="1"
						onChange={this.onShowCenterChange}
						checked={this.state.showCenter === '1'}
					></RadioButton>
					Pfeile anzeigen:
					<RadioButton
						inputId="rb2"
						name="center"
						value="2"
						onChange={this.onShowCenterChange}
						checked={this.state.showCenter === '2'}
					></RadioButton>
					Anzahl Umzüge anzeigen:
					<RadioButton
						inputId="rb3"
						name="center"
						value="3"
						onChange={this.onShowCenterChange}
						checked={this.state.showCenter === '3'}
					></RadioButton>
					<Checkbox inputId="showMap" value="showMap" onChange={this.onShowMapChange} checked={this.state.showMap}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Hintergrundkarte (online)</label>
					<Dropdown
						optionLabel="label"
						options={Config.getValue('offline', 'maps')}
						onChange={this.onOfflineMapChange}
						placeholder={this.state.offlineMap.label}
					/>
					<Slider
						min={0}
						max={classification.getMaxValue()}
						value={this.state.threshold}
						orientation="horizontal"
						onChange={(e) => this.setState({ threshold: e.value as number })}
					/>{' '}
					Es werden alle Pfeile mit einer bei Weg oder Zuzügen über {this.state.threshold} angezeigt
				</div>
				<div className="p-col-12">
					{/* <MapView geodata={this.props.geodata} nameField={this.props.geoName} items={this.props.items} selectedLocation={this.props.selectedLocation} onSelectLocation={this.props.onSelectLocation} showLabels={this.state.showLabels} theme={this.props.theme}/> */}
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
					/>
				</div>
				<div className="p-col-12">
					<Legend />
				</div>
			</div>
		);
	}

	private onShowCenterChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showCenter: e.value });
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
