import React from 'react';
import Geodata from '../../model/Geodata';
import Legend from '../elements/Legend';
import LeafletMapView from './LeafletMapView';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
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
	showLabels: boolean;
	showValues: boolean;
	showMap: boolean;
	showArrows: boolean;
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
		this.onShowLabelsChange = this.onShowLabelsChange.bind(this);
		this.onShowMapChange = this.onShowMapChange.bind(this);
		this.onShowArrowChange = this.onShowArrowChange.bind(this);
		this.onShowValueChange = this.onShowValueChange.bind(this);
		this.onOfflineMapChange = this.onOfflineMapChange.bind(this);
		this.state = {
			showLabels: true,
			showValues: true,
			showMap: true,
			showArrows: true,
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
					<Checkbox inputId="showlabels" value="showlabels" onChange={this.onShowLabelsChange} checked={this.state.showLabels}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Namen</label>
					<Checkbox inputId="showArrows" value="showArrows" onChange={this.onShowArrowChange} checked={this.state.showArrows}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Pfeile </label>
					<Checkbox inputId="showValues" value="showValues" onChange={this.onShowValueChange} checked={this.state.showValues}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Anzahl Umzüge </label>
					<input type="radio" name="center" value="1" /> zeige Namen
					<input type="radio" name="center" value="2" /> zeige Pfeile
					<input type="radio" name="center" value="3" /> zeige Anzahl Umzüge
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
						showLabels={this.state.showLabels}
						showValues={this.state.showValues}
						showMap={this.state.showMap}
						showArrows={this.state.showArrows}
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

	private onShowLabelsChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showLabels: e.checked });
	}

	private onShowMapChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showMap: e.checked });
	}

	private onShowArrowChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showArrows: e.checked });
	}

	private onShowValueChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showValues: e.checked });
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
