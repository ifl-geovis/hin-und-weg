// @ts-ignore
import { Map, TileLayer, Pane, Viewport, GeoJSON, Tooltip, Marker, PointToLayer, Style, withLeaflet, MapLayer, ImageOverlay } from 'react-leaflet';
import React, { Component } from 'react';
import Geodata from '../../model/Geodata';
import * as d3 from 'd3';
import { Feature, FeatureCollection } from 'geojson';
import R from 'ramda';
import L, { Layer, LatLngExpression } from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import * as turf from '@turf/turf';
import reduce from 'ramda/es/reduce';
import Classification from '../../data/Classification';

export interface ILeafletMapViewProps {
	items?: Array<{ [name: string]: any }> | null;
	geodata: Geodata | null;
	nameField?: string | null;
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	showLabels: boolean;
	showMap: boolean;
	showGeotiff: boolean;
	theme: string;
	/*centerpoints: FeatureCollection;*/
}

interface State {
	lat: number;
	lng: number;
	zoom: number;
	width: number;
	height: number;
}

export default class LeafletMapView extends Component<ILeafletMapViewProps, State> {
	protected colors = ['#f7f7f7', '#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
	protected colorsPos = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
	//http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=11
	protected colorsAll = ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];

	protected all_colors = ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
	// http://colorbrewer2.org/?type=sequential&scheme=PuBu&n=9
	//protected negative_colors = ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"];
	protected negative_colors = ['#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
	protected neutral_color = '#ffffff';

	private topLeft = [0, 0];
	private bottomRight = [0, 0];

	constructor(props: ILeafletMapViewProps) {
		super(props);
		console.log(props);
		this.state = {
			lat: 51.324605,
			lng: 12.377472,
			zoom: 13,
			height: 700,
			width: 600,
		};

		this.style = this.style.bind(this);
		this.pointToLayer = this.pointToLayer.bind(this);
	}

	public render(): JSX.Element {
		console.log('Render LaeletMapView');
		const position = [this.state.lat, this.state.lng];
		let geoDataJson;
		let labels;
		let geomap;
		let geotiff;
		let locationSwitch;
		let geotiffUrl = 'file://offline/geotiff.tif';

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			const classification = Classification.getCurrentClassification();

			if (this.props.showLabels) labels = this.getLabels();

			if (this.props.showMap) geomap = this.getMapLayer();

			if (this.props.showGeotiff) geotiff = this.getGeotiff();

			// let  name = geoDataJson.features[1].properties.Name;
		}

		// this.calcBounds();
		return (
			<Map center={position} zoom={this.state.zoom} onViewportChanged={this.onViewportChanged}>
				{/* <Pane name="d3" className="d3">
					{this.svgWrapper()}
				</Pane> */}

				{geomap}

				{geotiff}

				<GeoJSON data={geoDataJson} onEachFeature={this.onEachFeature} style={this.style}></GeoJSON>

				{labels}
			</Map>
		);
	}

	public getLabels() {
		let geoDataJson;
		let centerpoints;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <GeoJSON data={centerpoints} pointToLayer={this.pointToLayer}></GeoJSON>;
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

	public getGeotiff() {
		return (
			<ImageOverlay
				url="offline/leipzig.png"
				bounds={[
					[51.2070908, 12.0843612],
					[51.4377797, 12.7505515],
				]}
			/>
		);
	}

	public style(feature: Feature) {
		let hexcolor;
		const classification = Classification.getCurrentClassification();
		let name = 'Fehler!!!';
		if (feature.properties) name = String(feature.properties.Name);
		if (feature.properties && this.props.nameField) name = String(feature.properties[this.props.nameField]);

		if (this.props.items && this.props.items.length > 1) {
			switch (this.props.theme) {
				case 'Von': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Nach === name) {
								hexcolor = classification.getColor(item);

								return {
									fillColor: hexcolor,
									color: '#585858',
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

								return {
									fillColor: hexcolor,
									color: '#585858',
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

			pointsGeoJson.features[i].geometry = center.geometry;
		}

		return pointsGeoJson;
	}

	public pointToLayer(feature1: Feature, latlng: LatLngExpression) {
		let label = 'textTest';

		console.log('Showlabels: ', this.props.showLabels);

		if (this.props.showLabels) {
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

	public onEachFeature = (feature: Feature, layer: Layer) => {
		let name = '';

		layer.on('click', (e) => {
			if (feature.properties && this.props.nameField) name = feature.properties[this.props.nameField];

			this.props.onSelectLocation(name);
			//locationSwitch(name);
		});
	};

	onViewportChanged = (viewport: Viewport) => {
		console.log('onViewportChanged');
		// this.calcBounds();
	};
}
