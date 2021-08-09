// @ts-ignore
import { Pane, Map, Marker, Polygon, Tooltip, ScaleControl, TileLayer, GeoJSON, ImageOverlay, Circle, Viewport } from 'react-leaflet';
import React, { createRef, Component } from 'react';
import Log from '../../log';
import { Button } from 'primereact/button';
import Geodata from '../../model/Geodata';
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import L, { Layer, LatLngExpression, LatLng, point } from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import * as turf from '@turf/turf';
import Classification from '../../data/Classification';
import { IOfflineMaps } from '../../data/OfflineMaps';
// @ts-ignore
import 'leaflet-swoopy';
import { lowerFirst } from 'lodash';
import { options } from 'alasql';

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
	polygonTransparency: number;
}

interface Centerpoint {
	Center1: any;
}

export default class LeafletMapView extends Component<ILeafletMapViewProps, Centerpoint> {
	private static odd: boolean = true;

	centerpoint: { Center1: any };
	classification: Classification;
	mapRef: React.RefObject<any>;
	SwoopyArrows: Array<any> = [];
	name: String | undefined;

	constructor(props: ILeafletMapViewProps) {
		super(props);
		this.centerpoint = {
			Center1: null,
		};
		this.style = this.style.bind(this);
		this.pointToLayerNames = this.pointToLayerNames.bind(this);
		this.pointToLayerValues = this.pointToLayerValues.bind(this);
		this.pointToLayerArrowValues = this.pointToLayerArrowValues.bind(this);
		this.ArrowToLayer = this.ArrowToLayer.bind(this);
		this.classification = Classification.getCurrentClassification();
		this.extentMap = this.extentMap.bind(this);
		this.addArrowsEvents = this.addArrowsEvents.bind(this);
		this.mapRef = createRef();
		// console.log('CONSTRUCTOR LEAFLETMAPVIEW');
	}

	public render(): JSX.Element {
		// console.log('RENDER LEAFLETMAPVIEW');
		this.classification = Classification.getCurrentClassification();

		// Swoopy Arrows are always added when arrows1 or arrows2 are called.
		// They have to be cleared manually by following function.
		this.clearArrows();
		this.updateArrowHead();

		//Methode mit Query selector für arrwos um event hinzuzufügen
		//FP01

		let boundsOfGeodata: Array<Array<number>> = [];
		let geoDataJson;
		let labelsNames;
		let labelsValues1;
		let labelsValues2;
		let labelsPopUpArrows1;
		let labelsPopUpArrows2;
		let geomap;
		let arrows1;
		let arrows2;
		let offlinemap;
		let centerMarker;
		let featureBorder;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			boundsOfGeodata = this.calcGeodataBounds(geoDataJson);
			if (this.props.showCenter === '1') labelsNames = this.getLabelsNames();
			else if (this.props.showCenter === '2') {
				if (LeafletMapView.odd){ arrows1 = this.getArrows();
					labelsPopUpArrows1 = this.getLabelsArrows();
				}else{ 	arrows2 = this.getArrows();
						labelsPopUpArrows2 = this.getLabelsArrows();
				}
			} else if (this.props.showCenter === '3') {
				if (LeafletMapView.odd) labelsValues1 = this.getLabelsValues();
				else labelsValues2 = this.getLabelsValues();
			}
			if (this.centerpoint.Center1 != null && this.props.showCenter === '2') centerMarker = this.CenterMarker();
			if (this.props.selectedLocation) featureBorder = this.setFeatureBorder(geoDataJson);
			if (this.props.showMap) geomap = this.getMapLayer();
			if (this.props.offlineMap.file.length) offlinemap = this.getOfflineMap();

			this.addArrowsEvents();

		}
		LeafletMapView.odd = !LeafletMapView.odd;
		return (
			<div style={{position: "relative"}}>

			<Map bounds={boundsOfGeodata} ref={this.mapRef} zoomDelta={0.25} zoomSnap={0}>
				{geomap}
				{arrows1}
				{arrows2}
				<ScaleControl></ScaleControl>
				<Pane name="offlineMap" style={{ zIndex: 200 }}>
					{offlinemap}
				</Pane>
				<Pane name="districts" style={{ zIndex: 300 }}>
					<GeoJSON data={geoDataJson} onEachFeature={this.onEachFeature} style={this.style}></GeoJSON>
				</Pane>
				<Pane name="NamesPane" style={{ zIndex: 800 }}>
					{labelsNames}
				</Pane>
				<Pane name="ValuesPane1" style={{ zIndex: 800 }}>
					{labelsValues1}
				</Pane>
				<Pane name="centerMarker" style={{ zIndex: 900 }}>
					{centerMarker}
				</Pane>
				<Pane name="SwoopyPopUpCenter" style={{ zIndex: 900 }}>
					{centerMarker}
				</Pane>
				<Pane name="ValuesPane2" style={{ zIndex: 800 }}>
					{labelsValues2}
				</Pane>
				<Pane name="PopUpArrowsPane1" style={{ zIndex: 800 }}>
					{labelsPopUpArrows1}
				</Pane>
				<Pane name="PopUpArrowsPane2" style={{ zIndex: 800 }}>
					{labelsPopUpArrows2}
				</Pane>
				<Pane name="borderSelectedFeature" style={{ zIndex: 350 }}>
					{featureBorder}
				</Pane>
				<Button className="p-button-raised btnMapExtent" icon="pi pi-home" onClick={this.extentMap} />
			</Map>
			</div>
		);
	}

	public extentMap() {
		const map = this.mapRef.current.leafletElement;
		if (this.props.geodata) {
			const geoDataJson = this.props.geodata.getFeatureCollection();
			const boundsOfGeodata = this.calcGeodataBounds(geoDataJson);
			map.fitBounds(boundsOfGeodata);
		}
	}

	public clearArrows() {
		let svgArrows = Object.values(document.querySelectorAll('.swoopyArrow__marker')).map((marker) => marker.closest('svg'));
		svgArrows.forEach((svg) => {
			if (svg && svg.parentNode) svg.parentNode.removeChild(svg);
		});
	//	this.SwoopyArrows = [];
	}

	public addArrowsEvents() {

		document.addEventListener("mouseover", (event) => {
		const map = this.mapRef.current.leafletElement;
		let geoDataJson: FeatureCollection<Geometry, GeoJsonProperties>;


			//@ts-ignore
			if(!event.target.matches('.swoopyarrow__path')) return;

			//@ts-ignore
			const arrowpathID = event.target.id;
			const pattern = new RegExp(/\d+/);
			const id = arrowpathID.match(pattern);
			let color = "#007ad9";
			let lat = 0;
			let lng = 0;
			if(this.SwoopyArrows[id].color){
			console.log("color:",this.SwoopyArrows[id].color);
			console.log("SwoopyArrows ID:",this.SwoopyArrows[id]);

			color = this.SwoopyArrows[id].color;
			lat = this.SwoopyArrows[id].lat;
			lng = this.SwoopyArrows[id].lng}

			console.log("name:", name);

			map.eachLayer((layer: any) => {


/*			if(layer.options.pane == "SwoopyPopUpCenter"){
				layer.bindTooltip(`${this.SwoopyArrows[id].label} \n ${this.SwoopyArrows[id].value}`, {
					permanent: true,
					opacity: 0.7,
					className: 'district-label-arrow',
					id: 'tooltip-arrow',
					direction: 'center',
					backgroundcolor: "blue",
					color: color,
				})
				.openTooltip({ lat: lat, lng: lng });
				}
				*/
			let hoverbox = Array.from(document.getElementsByClassName('popup-label-arrow'+this.SwoopyArrows[id].label) as HTMLCollectionOf<HTMLElement>)

			console.log("hoverbox:",hoverbox.length);

			let i = 0;
			for(i = 0; i < hoverbox.length; i++){
				hoverbox[i].style.backgroundColor = color;
				hoverbox[i].style.display = "block";
			}
			}



			);

		});

		document.addEventListener("mouseout", (event) => {
			//@ts-ignore
			if(!event.target.matches('.swoopyarrow__path')) return;
			let hoverbox = Array.from(document.getElementsByClassName('popup-label-arrow'+name) as HTMLCollectionOf<HTMLElement>)

			let i = 0;
			for(i = 0; i < hoverbox.length; i++){
				hoverbox[i].style.display = "none";
			}

		});

	}


	public updateArrowHead() {
		const arrowHeadSVG = document.querySelector('#arrowHead path');
		if (arrowHeadSVG) {
			arrowHeadSVG.setAttribute('fill', this.classification.getPositiveArrowColor());
		}
	}

	public setFeatureBorder(geodata: any) {
		let polygon;
		for (let i = 0; i < geodata.features.length; i++) {
			if (
				this.props.nameField &&
				geodata.features[i].properties &&
				geodata.features[i].properties[this.props.nameField] == this.props.selectedLocation
			) {
				polygon = turf.flip(geodata.features[i]);
			}
		}
		return <Polygon color="purple" weight="3" fill="false" fillOpacity="0" positions={polygon.geometry.coordinates} />;
	}

	public calcGeodataBounds(geojson: FeatureCollection) {
		// @ts-ignore
		const bounds = turf.bbox(geojson);
		return [
			[bounds[1], bounds[0]],
			[bounds[3], bounds[2]],
		];
	}

	public getLabelsArrows() {
		let geoDataJson;
		let centerpoints;

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <GeoJSON data={centerpoints} pointToLayer={this.pointToLayerArrowValues}></GeoJSON>;
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

		if (this.props.geodata) {
			geoDataJson = this.props.geodata.getFeatureCollection();
			centerpoints = this.generateCenterPoints(geoDataJson);
		}

		return <GeoJSON data={centerpoints} pointToLayer={this.pointToLayerValues}></GeoJSON>;
	}

	public CenterMarker() {
		return <Circle center={this.centerpoint.Center1} radius={200} color="#c7c7c7" fillOpacity="1"></Circle>;
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
				attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				// attribution='Copyright <a href="http://www.bkg.bund.de/" target="_blank" rel="noopener noreferrer">Bundesamt für Kartographie und Geodäsie</a> 2020, <a href="http://sg.geodatenzentrum.de/web_public/Datenquellen_TopPlus_Open.pdf" target="_blank">Datenquellen</a>'
				// url="https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web_grau/default/WEBMERCATOR/{z}/{y}/{x}.png"
				//  attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
				//  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
			/>
		);
	}

	public getOfflineMap() {
		const lowerLeft3857: Array<number> = this.props.offlineMap.bounds[0];
		const upperRight3857: Array<number> = this.props.offlineMap.bounds[1];

		const lowerLeft4326: Array<number> = turf.toWgs84(lowerLeft3857);
		const upperRight4326: Array<number> = turf.toWgs84(upperRight3857);

		return (
			<ImageOverlay
				url={this.props.offlineMap.file}
				bounds={[
					[lowerLeft4326[1], lowerLeft4326[0]],
					[upperRight4326[1], upperRight4326[0]],
				]}
			/>
		);
	}

	public style(feature: Feature) {
		let hexcolor;
		let hexBodercolor;
		let borderWidth: number = 1;

		// const classification = Classification.getCurrentClassification();
		let name = 'Fehler!!!';
		if (feature.properties) name = String(feature.properties.Name);
		if (feature.properties && this.props.nameField) name = String(feature.properties[this.props.nameField]);

		if (this.props.items && this.props.items.length > 0) {
			switch (this.props.theme) {
				case 'Von': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Nach === name) {
								hexcolor = this.classification.getColor(item);
								hexBodercolor = this.classification.getBorderColor(item);

								return {
									fillColor: hexcolor,
									color: hexBodercolor,
									fillOpacity: this.props.polygonTransparency / 100,
									weight: borderWidth,
								};
							}
					}

					break;
				}
				case 'Nach': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Von === name) {
								hexcolor = this.classification.getColor(item);
								hexBodercolor = this.classification.getBorderColor(item);

								return {
									fillColor: hexcolor,
									color: hexBodercolor,
									fillOpacity: this.props.polygonTransparency / 100,
									weight: borderWidth,
								};
							}
					}

					break;
				}
				case 'Saldi': {
					for (let item of this.props.items) {
						if (feature.properties)
							if (item.Von === name) {
								hexcolor = this.classification.getColor(item);
								hexBodercolor = this.classification.getBorderColor(item);

								return {
									fillColor: hexcolor,
									color: '#585858',
									fillOpacity: this.props.polygonTransparency / 100,
									weight: borderWidth,
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
			fillColor: '#f7f7f7',
			color: '#585858',
			weight: borderWidth,
		};
	}

	public generateCenterPoints(geoDataJson: FeatureCollection) {
		let pointsGeoJson = cloneDeep(geoDataJson);

		for (let i = 0; i < pointsGeoJson.features.length; i++) {
			// @ts-ignore
			var center = turf.centerOfMass(pointsGeoJson.features[i]);

			// @ts-ignore
			if (
				pointsGeoJson.features[i] &&
				pointsGeoJson.features[i].properties &&
				this.props.nameField &&
				// @ts-ignore
				pointsGeoJson.features[i].properties[this.props.nameField] == this.props.selectedLocation
			) {
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
		if (feature1.properties && this.props.nameField) name = String(feature1.properties[this.props.nameField]);

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

	public pointToLayerArrowValues(feature1: Feature, latlng: LatLngExpression) {
		let label = '';
		let name = 'Fehler!!!';

		if (feature1.properties) name = String(feature1.properties.Name);
		if (feature1.properties && this.props.nameField) name = String(feature1.properties[this.props.nameField]);

			if (this.props.items && this.props.items.length > 0) {
				switch (this.props.theme) {
					case 'Von': {
						for (let item of this.props.items) {
							if (item.Nach === name) {
								label = item.Nach + "¦" + String(item.Wert);
							}
						}

						break;
					}
					case 'Nach': {
						for (let item of this.props.items) {
							if (item.Von === name) {
								label = item.Von + "¦" + String(item.Wert);
							}
						}
						break;
					}
					case 'Saldi': {
						for (let item of this.props.items) {
							if (item.Von === name) {
								label = item.Von + "¦" + String(item.Wert);
							}
						}
					}

					default: {
						break;
					}
				}
			}

			if (name === this.props.selectedLocation) {
				return new L.CircleMarker(latlng, {
					radius: 1,
				})
					.bindTooltip(label, {
						permanent: true,
						opacity: 0.7,
						className: 'popup-label-arrow' + name +" popup-label-arrow",
						direction: 'center',

					})
					.openTooltip();
			}

			return new L.CircleMarker(latlng, {
				radius: 1,
			})
				.bindTooltip(label, {
					permanent: true,
					opacity: 0.7,
					className: 'popup-label-arrow' + name +" popup-label-arrow",
					direction: 'center',
				})
				.openTooltip();

	}


	public pointToLayerValues(feature1: Feature, latlng: LatLngExpression) {
		let label = '';
		let name = 'Fehler!!!';

		if (feature1.properties) name = String(feature1.properties.Name);
		if (feature1.properties && this.props.nameField) name = String(feature1.properties[this.props.nameField]);

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

			if (name === this.props.selectedLocation) {
				return new L.CircleMarker(latlng, {
					radius: 1,
				})
					.bindTooltip(label, {
						permanent: true,
						opacity: 0.7,
						className: 'district-label-grey',
						direction: 'center',
					})
					.openTooltip();
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
		let posx;
		let posy;
		if (feature1.properties && this.props.nameField && this.props.items) {
			if (this.props.theme == 'Saldi') {
				for (let item of this.props.items) {
					if (item.Nach == this.props.selectedLocation && item.Von == feature1.properties[this.props.nameField]) {
						if (feature1.properties && this.props.nameField) {
							if (item.Wert > 0 && item.Wert > this.props.threshold && item.Von != item.Nach) {

								this.SwoopyArrows.push({label: item.Von, value: item.Wert, color: this.classification.getNegativeArrowColor(),
									// this.SwoopyArrows.push({label: feature1.properties.Name, value: item.Wert, color: this.classification.getNegativeArrowColor(),
								// @ts-ignore
								lat: latlng.lat, lng: latlng.lng});
								// @ts-ignore
								return new L.swoopyArrow(latlng, this.centerpoint.Center1, {
									color: this.classification.getNegativeArrowColor(),
									factor: 0.75,
									weight: this.classification.getArrowWidth(item.Wert),
									hideArrowHead: true,
									label: item.Wert,
								}).openTooltip();
							} else if (item.Wert < 0 && Math.abs(item.Wert) > this.props.threshold && item.Von != item.Nach) {
								this.SwoopyArrows.push({label: item.Von, value: item.Wert, color: this.classification.getPositiveArrowColor(),
									// this.SwoopyArrows.push({label: feature1.properties.Name, value: item.Wert, color: this.classification.getPositiveArrowColor(),
									// @ts-ignore
									lat: latlng.lat, lng: latlng.lng});
								// @ts-ignore
								return new L.swoopyArrow(this.centerpoint.Center1, latlng, {
									color: this.classification.getPositiveArrowColor(),
									factor: 0.75,
									weight: this.classification.getArrowWidth(item.Wert),
									arrowId: '#arrowHead',
								}).openTooltip();
							}
						}
					}
				}
			} else if (this.props.theme == 'Von') {
				for (let item of this.props.items) {
					if (item.Von == this.props.selectedLocation && item.Nach == feature1.properties[this.props.nameField]) {
						if (feature1.properties && this.props.nameField && item.Wert > this.props.threshold && item.Von != item.Nach) {
							console.log("lat:" ,this.centerpoint.Center1.lat);
							console.log("lng:" ,this.centerpoint.Center1.lng);
								this.SwoopyArrows.push({label: item.Nach, value: item.Wert, color: this.classification.getPositiveArrowColor(),
									// this.SwoopyArrows.push({label: feature1.properties.Name, value: item.Wert, color: this.classification.getPositiveArrowColor(),
							// @ts-ignore
								lat: latlng.lat, lng: latlng.lng});
							// @ts-ignore
							return new L.swoopyArrow(this.centerpoint.Center1, latlng, {
								color: this.classification.getPositiveArrowColor(),
								factor: 0.75,
								weight: this.classification.getArrowWidth(item.Wert),
								arrowId: '#arrowHead',
								label: item.Wert,
							}).openTooltip();
						}
					}
				}
			}
			if (this.props.theme == 'Nach') {
				for (let item of this.props.items) {
					if (item.Nach == this.props.selectedLocation && item.Von == feature1.properties[this.props.nameField]) {
						if (feature1.properties && this.props.nameField && item.Wert > this.props.threshold && item.Von != item.Nach) {
							this.SwoopyArrows.push({label: item.Von, value: item.Wert, color: this.classification.getNegativeArrowColor(),
								// this.SwoopyArrows.push({label: feature1.properties.Name, value: item.Wert, color: this.classification.getNegativeArrowColor(),
								// @ts-ignore
								lat: latlng.lat, lng: latlng.lng});
							// @ts-ignore
							return new L.swoopyArrow(latlng, this.centerpoint.Center1, {
								color: this.classification.getNegativeArrowColor(),
								factor: 0.75,
								weight: this.classification.getArrowWidth(item.Wert),
								hideArrowHead: true,
								label: item.Wert,
							}).openTooltip();
						}
					}
				}
			} else return;
		}
	}

	public onEachFeature = (feature: Feature, layer: Layer) => {
		layer.on({
			'click': () => {
				let name: string = '';
				if (feature.properties && this.props.nameField) name = feature.properties[this.props.nameField];
				this.props.onSelectLocation(name);
				this.style(feature);
			},
			'mouseover': (e) => {
				if (feature.properties && this.props.nameField && this.props.items) {
					const name: string = e.target.feature.properties[this.props.nameField];
					const value: any = this.props.items.find((item) => item[this.props.theme === 'Von' ? 'Nach' : 'Von'] === name);
					// console.log(
					// 	'MOUSEOVER',
					// 	this.props.items,
					// 	this.props.theme,
					// 	name,
					// 	this.props.items.find((item) => item.Nach === name)
					// );
					let label: string = '';
					switch (this.props.showCenter) {
						case '1':
							label = `${value ? value.Wert : ''}`;
							break;
						case '2':
							label = `${name} / ${value ? value.Wert : ''}`;
							break;
						case '3':
							label = `${name}`;
							break;
						case '4':
							label = `${name} / ${value ? value.Wert : ''}`;
							break;
					}
					let center = turf.centerOfMass(e.target.feature);
					label && layer.bindTooltip(label, { direction: 'bottom', offset: point(0, 10), className: 'mouseOverlayTooltip' });
					label && layer.openTooltip({ lat: center.geometry.coordinates[1], lng: center.geometry.coordinates[0] });
				}
			},
			'mouseout': () => {
				layer.unbindTooltip();
				layer.closeTooltip();
			},
		});
	};
}
function foreach(layers: any) {
	throw new Error('Function not implemented.');
}

