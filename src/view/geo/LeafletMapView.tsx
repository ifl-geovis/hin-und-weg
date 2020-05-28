// @ts-ignore
import { Map, TileLayer, Pane, Viewport, GeoJSON, Tooltip, Marker, PointToLayer, Style } from 'react-leaflet';
import React, { Component } from 'react';
import Geodata from '../../model/Geodata';
import * as d3 from 'd3';
import { Feature, FeatureCollection } from 'geojson';
import R from 'ramda';
import L, { Layer, LatLngExpression } from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import * as turf from '@turf/turf';
import reduce from 'ramda/es/reduce';
import Classification from "../../data/Classification";



export interface ILeafletMapViewProps {
  items?: Array<{ [name: string]: any }> | null;
  geodata: Geodata | null;
  nameField?: string | null;
  selectedLocation?: string | null;
  onSelectLocation: (newLocation: string) => void;
  showLabels: boolean;
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
  protected colorsAll = [
    '#67001f',
    '#b2182b',
    '#d6604d',
    '#f4a582',
    '#fddbc7',
    '#f7f7f7',
    '#d1e5f0',
    '#92c5de',
    '#4393c3',
    '#2166ac',
    '#053061',
  ];

  protected all_colors = [
    '#67001f',
    '#b2182b',
    '#d6604d',
    '#f4a582',
    '#fddbc7',
    '#f7f7f7',
    '#d1e5f0',
    '#92c5de',
    '#4393c3',
    '#2166ac',
    '#053061',
  ];
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
  }

  public render(): JSX.Element {
    const position = [this.state.lat, this.state.lng];
    let geoDataJson;
    let centerpoints;
    let locationSwitch;
    
 
    if (this.props.geodata) {
    geoDataJson = this.props.geodata.getFeatureCollection();
    centerpoints = this.generateCenterPoints(geoDataJson)
    const classification = Classification.getCurrentClassification();
    


  // let  name = geoDataJson.features[1].properties.Name;
    
  }



    // this.calcBounds();
    return (
      <Map center={position} zoom={this.state.zoom} onViewportChanged={this.onViewportChanged}>
        {/* <Pane name="d3" className="d3">
					{this.svgWrapper()}
				</Pane> */}
        <TileLayer
        //  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'*/
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        //  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON data={geoDataJson} onEachFeature={this.onEachFeature} style={this.style}>
            
        </GeoJSON>

        <GeoJSON data={centerpoints} pointToLayer={this.pointToLayer}>
            
        </GeoJSON>

      </Map>
    );
  }

  
  
  public style(feature: Feature) {

    let hexcolor;
    const classification = Classification.getCurrentClassification();

    if(this.props.items && this.props.items.length > 1){
      switch(this.props.theme) {
      case "Von":{

        for (let item of this.props.items)
		    {
          if(feature.properties)
            if(item.Nach === String(feature.properties.Name)){
              hexcolor = classification.getColor(item);

              return{
                color: hexcolor
              }
            }
        }

        break;
     }
     case "Nach":{

      for (let item of this.props.items)
		    {
          if(feature.properties)
            if(item.Von === String(feature.properties.Name)){
              hexcolor = classification.getColor(item);

              return{
                color: hexcolor
              }
            }
        }

      break;
     }
     case "Saldi":{

      for (let item of this.props.items)
		    {
          if(feature.properties)
            if(item.Von === String(feature.properties.Name)){
              hexcolor = classification.getColor(item);

              return{
                color: hexcolor
              }
            }
        }

      break;
     }
     default: {
       break;
     } 
    }
  }
  return{
    color: "#0099ff"
  }

  }

  public generateCenterPoints(geoDataJson: FeatureCollection) {


    let pointsGeoJson = cloneDeep(geoDataJson);

    for(let i = 0; i < pointsGeoJson.features.length; i++){

      // @ts-ignore
      var center = turf.centerOfMass(pointsGeoJson.features[i]);

      pointsGeoJson.features[i].geometry = center.geometry;

    } 

    console.log(pointsGeoJson);

    return pointsGeoJson;

  }



  public pointToLayer(feature1: Feature, latlng: LatLngExpression) {

    let label = "textTest";

    if(feature1.properties)
      label = String(feature1.properties.Name) // Must convert to string, .bindTooltip can't use straight 'feature.properties.attribute'

    return new L.CircleMarker(latlng, {
      radius: 1,
    }).bindTooltip(label, {permanent: true, opacity: 0.7, className:"district-label", direction: "center"}).openTooltip();

  }

  public onEachFeature = (feature: Feature, layer: Layer) => {
    
    let name = "";

    layer.on('click', (e) => {

      if(feature.properties)
        name = feature.properties.Name;

      console.log("Name: ", name);
      this.props.onSelectLocation(name);
      //locationSwitch(name);


    });

  }

  onViewportChanged = (viewport: Viewport) => {
    console.log('onViewportChanged');
    // this.calcBounds();
  };

  
}
