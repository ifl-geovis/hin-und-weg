import React from 'react';
import Geodata from '../../model/Geodata';
import Legend from '../elements/Legend';
import LeafletMapView from './LeafletMapView';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import Config from '../../config';

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
	showMap: boolean;
	showArrows: boolean;
	offlineMap: IOfflineMaps;
}

export default class GeodataView extends React.Component<IGeodataProps, IGeodataState> {
	constructor(props: IGeodataProps) {
		super(props);
		this.onShowLabelsChange = this.onShowLabelsChange.bind(this);
		this.onShowMapChange = this.onShowMapChange.bind(this);
		this.onShowArrowChange = this.onShowArrowChange.bind(this);
		this.onOfflineMapChange = this.onOfflineMapChange.bind(this);
		this.state = {
			showLabels: true,
			showMap: true,
			showArrows: true,
			offlineMap: {
				label: 'Offline Map auswählen',
				file: '',
				bounds: [],
			},
		};
	}

	public render(): JSX.Element {
		console.log('render von geodataview', Config.getValue('offline', 'maps'));

		return (
			<div className="p-grid">
				<div className="p-col-12">
					<Checkbox inputId="showlabels" value="showlabels" onChange={this.onShowLabelsChange} checked={this.state.showLabels}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Namen</label>
					<Checkbox inputId="showArrows" value="showArrows" onChange={this.onShowArrowChange} checked={this.state.showArrows}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Pfeile </label>
					<Checkbox inputId="showMap" value="showMap" onChange={this.onShowMapChange} checked={this.state.showMap}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Hintergrundkarte (online)</label>
					
					<Dropdown
						optionLabel="label"
						options={Config.getValue('offline', 'maps')}
						onChange={this.onOfflineMapChange}
						placeholder={this.state.offlineMap.label}
					/>
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
						showMap={this.state.showMap}
						showArrows={this.state.showArrows}
						offlineMap={this.state.offlineMap}
						theme={this.props.theme}
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
