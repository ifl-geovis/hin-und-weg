import R from 'ramda';
import React from 'react';
import Geodata from '../../model/Geodata';
import SelectInput from '../input/SelectInput';
import Legend from '../elements/Legend';
import LeafletMapView from './LeafletMapView';
import { Checkbox } from 'primereact/checkbox';

export interface IGeodataProps {
	items?: Array<{ [name: string]: any }> | null;
	geodata: Geodata | null;
	geoName: string | null;
	locations: string[];
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	theme: string;
}

interface IGeodataState {
	showLabels: boolean;
	showMap: boolean;
	showGeotiff: boolean;
}

export default class GeodataView extends React.Component<IGeodataProps, IGeodataState> {
	constructor(props: IGeodataProps) {
		super(props);
		this.onShowLabelsChange = this.onShowLabelsChange.bind(this);
		this.onShowMapChange = this.onShowMapChange.bind(this);
		this.onShowGeotiffChange = this.onShowGeotiffChange.bind(this);
		this.state = {
			showLabels: true,
			showMap: true,
			showGeotiff: false,
		};
	}

	public render(): JSX.Element {
		console.log('render von geodataview');

		var center_points2 = [
			{
				'type': 'Feature',
				'properties': { 'name': '1' },
				'geometry': { 'type': 'Point', 'coordinates': [50.02507178240552, 13.672508785052223] },
			},
			{
				'type': 'Feature',
				'properties': { 'name': '6' },
				'geometry': { 'type': 'Point', 'coordinates': [55.02480935075292, 13.672888247036376] },
			},
			{
				'type': 'Feature',
				'properties': { 'name': '12' },
				'geometry': { 'type': 'Point', 'coordinates': [60.02449372349508, 13.672615176262731] },
			},
			{
				'type': 'Feature',
				'properties': { 'name': '25' },
				'geometry': { 'type': 'Point', 'coordinates': [65.0240752514004, 13.673313811878423] },
			},
		];

		return (
			<div className="p-grid">
				<div className="p-col-12">
					<Checkbox inputId="showlabels" value="showlabels" onChange={this.onShowLabelsChange} checked={this.state.showLabels}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Namen</label>
					<Checkbox inputId="showMap" value="showMap" onChange={this.onShowMapChange} checked={this.state.showMap}></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Hintergrundkarte (online)</label>
					<Checkbox
						inputId="showGeotiff"
						value="showGeotiff"
						onChange={this.onShowGeotiffChange}
						checked={this.state.showGeotiff}
					></Checkbox>
					<label className="p-checkbox-label chkBoxMap">zeige Hintergrundkarte (offline)</label>
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
						showGeotiff={this.state.showGeotiff}
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

	private onShowGeotiffChange(e: { originalEvent: Event; value: string; checked: boolean }) {
		this.setState({ showGeotiff: e.checked });
	}
}
