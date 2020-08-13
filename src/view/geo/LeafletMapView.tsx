// @ts-ignore
import { Pane, Map, Marker, TileLayer, GeoJSON, ImageOverlay, Circle } from 'react-leaflet';
import React, { Component } from 'react';
import Geodata from '../../model/Geodata';
import { Feature, FeatureCollection } from 'geojson';
import L, { Layer, LatLngExpression, LatLng } from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import * as turf from '@turf/turf';
import Classification from '../../data/Classification';
import { IOfflineMaps } from './GeodataView';
// @ts-ignore
import 'leaflet-swoopy';
import { color } from 'd3';

export interface ILeafletMapViewProps {
	items?: Array<{ [name: string]: any }> | null;
	geodata: Geodata | null;
	nameField?: string | null;
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	showCenter: String;
	showMap: boolean;
	offlineMap: IOfflineMaps;
	theme: string;
	threshold: number;
}

interface State {
	zoom: number;
}

interface Centerpoint {
	Center1: any;
}

interface Points {}

export default class LeafletMapView extends Component<ILeafletMapViewProps, State, Centerpoint> {
	centerpoint: { Center1: any };
	constructor(props: ILeafletMapViewProps) {
		super(props);
		this.state = {
			zoom: 11,
		};
		this.centerpoint = {
			Center1: null,
		};

		this.style = this.style.bind(this);
		this.pointToLayerNames = this.pointToLayerNames.bind(this);
		this.pointToLayerValues = this.pointToLayerValues.bind(this);
		this.ArrowToLayer = this.ArrowToLayer.bind(this);
	}

	public render(): JSX.Element {
		let centerOfMap;
		let geoDataJson;
		let labelsNames;
		let labelsValues;
		let geomap;
		let arrows;
		let offlinemap;
		let centerMarker;
		let selectedFeature;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerOfMap = this.calcMapCenter(geoDataJson);
			if (this.props.showCenter === '1') labelsNames = this.getLabelsNames();
			else if (this.props.showCenter === '2') arrows = this.getArrows();
			else if (this.props.showCenter === '3') labelsValues = this.getLabelsValues();
			if (this.centerpoint.Center1 != null) centerMarker = this.CenterMarker();

			for (let i = 0; i < geoDataJson.features.length; i++) {
				if (geoDataJson.features[i].properties!.Name == this.props.selectedLocation) {
					selectedFeature = geoDataJson.features[i];
				}
			}

			if (this.props.showMap) geomap = this.getMapLayer();
			if (this.props.offlineMap.file.length) offlinemap = this.getOfflineMap();
		}
		return (
			<Map center={centerOfMap} zoom={this.state.zoom}>
				{geomap}
				{offlinemap}
				<GeoJSON data={geoDataJson} onEachFeature={this.onEachFeature} style={this.style}></GeoJSON>
				<Pane name="ArrowPane" style={{ zIndex: 800 }}>
					{arrows}
				</Pane>
				<Pane name="NamesPane" style={{ zIndex: 800 }}>
					{labelsNames}
				</Pane>
				<Pane name="ValuesPane" style={{ zIndex: 800 }}>
					{labelsValues}
				</Pane>
				<Pane name="centerMarker" style={{ zIndex: 900 }}>
					{centerMarker}
				</Pane>
			</Map>
		);
	}

	public calcMapCenter(geojson: FeatureCollection) {
		// @ts-ignore
		const center = turf.centerOfMass(geojson);
		return [center.geometry.coordinates[1], center.geometry.coordinates[0]];
	}

	public getLabelsNames() {
		let geoDataJson;
		let centerpoints;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <GeoJSON data={centerpoints} pointToLayer={this.pointToLayerNames}></GeoJSON>;
	}

	public getLabelsValues() {
		let geoDataJson;
		let centerpoints;

		console.log('getLabelsValues');

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <GeoJSON data={centerpoints} pointToLayer={this.pointToLayerValues}></GeoJSON>;
	}

	public CenterMarker() {
		let geoDataJson;
		let centerpoints;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <Circle center={this.centerpoint.Center1} radius={100} color="#0432ff" fillColor="#0432ff"></Circle>;
	}

	public getArrows() {
		let geoDataJson;
		let centerpoints;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <GeoJSON data={centerpoints} pointToLayer={this.ArrowToLayer}></GeoJSON>;
	}

	public getMapLayer() {
		return (
			<TileLayer
				//attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				//url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				attribution='Copyright <a href="http://www.bkg.bund.de/" target="_blank" rel="noopener noreferrer">Bundesamt für Kartographie und Geodäsie</a> 2020, <a href="http://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf" target="_blank">Datenquellen</a>'
				url="https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png"
				//  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				//  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
			/>
		);
	}

	public getOfflineMap() {
		return <ImageOverlay url={this.props.offlineMap.file} bounds={this.props.offlineMap.bounds} />;
	}

	public style(feature: Feature) {
		let hexcolor;
		let hexBodercolor;
		const classification = Classification.getCurrentClassification();
		let name = 'Fehler!!!';
		if (feature.properties) name = String(feature.properties.Name);
		if (feature.properties && this.props.nameField) name = String(feature.properties[this.props.nameField]);

		if (this.props.items && this.props.items.length > 0) {
			switch (this.props.theme) {
				case 'Von': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Nach === name) {
								hexcolor = classification.getColor(item);
								hexBodercolor = classification.getBorderColor(item);

								return {
									fillColor: hexcolor,
									color: hexBodercolor,
									fillOpacity: 0.75,
								};
							}
					}

					break;
				}
				case 'Nach': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Von === name) {
								hexcolor = classification.getColor(item);
								hexBodercolor = classification.getBorderColor(item);

								return {
									fillColor: hexcolor,
									color: hexBodercolor,
									fillOpacity: 0.75,
								};
							}
					}

					break;
				}
				case 'Saldi': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Von === name) {
								hexcolor = classification.getColor(item);
								hexBodercolor = classification.getBorderColor(item);

								return {
									fillColor: hexcolor,
									color: '#585858',
									fillOpacity: 0.75,
								};
							}
					}

					break;
				}
				default: {
					break;
				}
			}
		}
		return {
			fillColor: '#0099ff',
			color: '#585858',
		};
	}

	public generateCenterPoints(geoDataJson: FeatureCollection) {
		let pointsGeoJson = cloneDeep(geoDataJson);

		for (let i = 0; i < pointsGeoJson.features.length; i++) {
			// @ts-ignore
			var center = turf.centerOfMass(pointsGeoJson.features[i]);

			if (pointsGeoJson.features[i].properties!.Name == this.props.selectedLocation) {
				this.centerpoint.Center1 = new LatLng(center.geometry.coordinates[1], center.geometry.coordinates[0]);
			}

			pointsGeoJson.features[i].geometry = center.geometry;
		}

		return pointsGeoJson;
	}

	public pointToLayerNames(feature1: Feature, latlng: LatLngExpression) {
		let label = '';
		let name = 'Fehler!!!';
		if (feature1.properties) name = String(feature1.properties.Name);

		if (this.props.showCenter === '1') {
			if (feature1.properties && this.props.nameField) label = String(feature1.properties[this.props.nameField]); // Must convert to string, .bindTooltip can't use straight 'feature.properties.attribute'

			return new L.CircleMarker(latlng, {
				radius: 1,
			})
				.bindTooltip(label, {
					permanent: true,
					opacity: 0.7,
					className: 'district-label',
					direction: 'center',
				})
				.openTooltip();
		} else {
			return;
		}
	}

	public pointToLayerValues(feature1: Feature, latlng: LatLngExpression) {
		let label = '';
		let name = 'Fehler!!!';

		if (feature1.properties) name = String(feature1.properties.Name);

		if (this.props.showCenter === '3') {
			if (this.props.items && this.props.items.length > 0) {
				switch (this.props.theme) {
					case 'Von': {
						for (let item of this.props.items) {
							if (item.Nach === name) {
								label = String(item.Wert);
							}
						}

						break;
					}
					case 'Nach': {
						for (let item of this.props.items) {
							if (item.Von === name) {
								label = String(item.Wert);
							}
						}
						break;
					}
					case 'Saldi': {
						for (let item of this.props.items) {
							if (item.Von === name) {
								label = String(item.Wert);
							}
						}
					}

					default: {
						break;
					}
				}
			}

			return new L.CircleMarker(latlng, {
				radius: 1,
			})
				.bindTooltip(label, {
					permanent: true,
					opacity: 0.7,
					className: 'district-label',
					direction: 'center',
				})
				.openTooltip();
		} else {
			return;
		}
	}

	public ArrowToLayer(feature1: Feature, latlng: LatLngExpression) {
		let label = 'textTest';
		let geoDataJson;
		let centerofFeature;

		<marker id="dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
			<circle cx="5" cy="5" r="5" fill="green" />
		</marker>;

		const classification = Classification.getCurrentClassification();

		if (this.props.showCenter === '2' && feature1.properties && this.props.nameField && this.props.items) {
			if (this.props.theme == 'Saldi') {
				for (let item of this.props.items) {
					if (item.Nach == this.props.selectedLocation && item.Von == feature1.properties[this.props.nameField]) {
						if (feature1.properties && this.props.nameField) {
							if (item.Wert > 0 && item.Wert > this.props.threshold && item.Von != item.Nach) {
								// @ts-ignore
								return new L.swoopyArrow(latlng, this.centerpoint.Center1, {
									text: this.props.selectedLocation,
									color: '#0432ff',
									textClassName: 'swoopy-arrow',
									factor: 0.75,
									weight: 2,
									iconSize: [60, 20],
									iconAnchor: [60, 5],
									arrowFilled: true,
									arrowId: 'dot',
								}).openTooltip();
							} else if (item.Wert < 0 && Math.abs(item.Wert) > this.props.threshold && item.Von != item.Nach) {
								// @ts-ignore
								return new L.swoopyArrow(this.centerpoint.Center1, latlng, {
									text: this.props.selectedLocation,
									color: '#FF0000',
									textClassName: 'swoopy-arrow',
									factor: 0.75,
									weight: 2,
									iconSize: [60, 20],
									iconAnchor: [60, 5],
									arrowFilled: true,
								}).openTooltip();
							}
						}
					}
				}
			} else if (this.props.theme == 'Von') {
				for (let item of this.props.items) {
					if (item.Von == this.props.selectedLocation && item.Nach == feature1.properties[this.props.nameField]) {
						if (feature1.properties && this.props.nameField && item.Wert > this.props.threshold && item.Von != item.Nach) {
							// @ts-ignore
							return new L.swoopyArrow(this.centerpoint.Center1, latlng, {
								text: this.props.selectedLocation,
								color: '#FF0000',
								textClassName: 'swoopy-arrow',
								factor: 0.75,
								weight: 2,
								iconSize: [60, 20],
								iconAnchor: [60, 5],
								arrowFilled: true,
							}).openTooltip();
						}
					}
				}
			}
			if (this.props.theme == 'Nach') {
				for (let item of this.props.items) {
					if (item.Nach == this.props.selectedLocation && item.Von == feature1.properties[this.props.nameField]) {
						if (feature1.properties && this.props.nameField && item.Wert > this.props.threshold && item.Von != item.Nach) {
							// @ts-ignore
							return new L.swoopyArrow(latlng, this.centerpoint.Center1, {
								text: this.props.selectedLocation,
								color: '#0432ff',
								textClassName: 'swoopy-arrow',
								factor: 0.75,
								weight: 2,
								iconSize: [60, 20],
								iconAnchor: [60, 5],
								arrowFilled: true,
								arrowId: 'dot',
							}).openTooltip();
						}
					}
				}
			} else return;
		}
	}

	public onEachFeature = (feature: Feature, layer: Layer) => {
		let name = '';

		layer.on('click', (e) => {
			if (feature.properties && this.props.nameField) name = feature.properties[this.props.nameField];
			this.props.onSelectLocation(name);

			console.log(e);
			this.style(feature);
		});
	};
}
