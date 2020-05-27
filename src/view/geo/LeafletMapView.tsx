// @ts-ignore
import { Map, TileLayer, Pane, Viewport, GeoJSON, Tooltip, Marker, PointToLayer } from 'react-leaflet';
import React, { Component } from 'react';
import Geodata from '../../model/Geodata';
import * as d3 from 'd3';
import { Feature, FeatureCollection } from 'geojson';
import R from 'ramda';
import L, { Layer, LatLngExpression } from 'leaflet';
import cloneDeep from 'lodash/cloneDeep';
import * as turf from '@turf/turf';



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
    this.pickColor = this.pickColor.bind(this);
  }

  public render(): JSX.Element {
    const position = [this.state.lat, this.state.lng];
    let geoDataJson;
    let centerpoints;
    
    

    if (this.props.geodata) {
    console.log("Geodata: " , this.props.geodata.getFeatureCollection());
    geoDataJson = this.props.geodata.getFeatureCollection();
    centerpoints = this.generateCenterPoints(geoDataJson)
    


  // let  name = geoDataJson.features[1].properties.Name;
    
  }



    // this.calcBounds();
    return (
      <Map center={position} zoom={this.state.zoom} onViewportChanged={this.onViewportChanged}>
        {/* <Pane name="d3" className="d3">
					{this.svgWrapper()}
				</Pane> */}
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON data={geoDataJson} onEachFeature={this.onEachFeature} pointToLayer={this.pointToLayer}>
            
        </GeoJSON>

        <GeoJSON data={centerpoints} pointToLayer={this.pointToLayer}>
            
        </GeoJSON>

      </Map>
    );
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
    
    
    /* if (feature.properties && feature.properties.name) {
        
      if (feature.properties && feature.properties.name) {

        let label = String(feature.properties.name);
        let latlng =  [feature.geometry.bbox?.[0] , feature.geometry.bbox?.[1]] 
          
          
      return (new L.CircleMarker(latlng, {
        radius: 1,
        }).bindTooltip(label , {permanent: true, opacity: 0.7}).openTooltip())
      }



    } */


  }

  onViewportChanged = (viewport: Viewport) => {
    console.log('onViewportChanged');
    // this.calcBounds();
  };

  private calcBounds() {
    const geodata = this.props.geodata;
    if (geodata) {
      const projection = d3.geoMercator().fitSize([this.state.width, this.state.height], geodata.getFeatureCollection());
      const path = d3.geoPath().projection(projection);
      const bounds = path.bounds(geodata.getFeatureCollection());
      this.topLeft = bounds[0];
      this.bottomRight = bounds[1];
    }
  }

  private svgWrapper(): object {
    const geodata = this.props.geodata;
    if (geodata == null) {
      return [
        <g key="no-geodata">
          <text
            transform={'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'}
            style={{ fill: '#000000', stroke: '#aaaaaa' }}
          >
            Keine Geodaten geladen
          </text>
        </g>,
      ];
    }

    return (
      <svg
        id="d3Svg"
        width={this.bottomRight[0] - this.topLeft[0]}
        height={this.bottomRight[1] - this.topLeft[1]}
        style={{ left: this.topLeft[0] + 'px', top: this.topLeft[1] + 'px' }}
      >
        {this.createD3Map()}
      </svg>
    );
  }

  private createD3Map(): object {
    const geodata = this.props.geodata;
    if (geodata == null) {
      return [
        <g key="no-geodata">
          <text
            transform={'translate(' + this.state.width / 2 + ',' + this.state.height / 2 + ')'}
            style={{ fill: '#000000', stroke: '#aaaaaa' }}
          >
            Keine Geodaten geladen
          </text>
        </g>,
      ];
    }
    const projection = d3.geoMercator().fitSize([this.state.width, this.state.height], geodata.getFeatureCollection());
    const path = d3.geoPath().projection(projection);
    const indexedMap = R.addIndex(R.map);
    const features = indexedMap((feature, id: number): JSX.Element => {
      const f = feature as Feature;
      let title = '';
      if (this.props.nameField == null) {
        const firstProp = R.head(R.keys(f.properties!));
        title = R.prop(firstProp!, f.properties!);
      } else {
        title = R.prop(this.props.nameField, f.properties!);
      }
      const style = this.getStyleFor(title, f);
      return (
        <g key={id} transform={'translate(' + -this.topLeft[0] + ',' + -this.topLeft[1] + ')'}>
          <path
            d={path(f) || undefined}
            style={style}
            key={id}
            onClick={(e) => {
              this.props.onSelectLocation(title);
            }}
          />
        </g>
      );
    }, geodata.getFeatures());

    return features;
  }

  private getStyleFor(title: string, feature: Feature): object {
    if (this.props.selectedLocation === title) {
      return { fill: '#cbf719', stroke: '#000000' };
    } else {
      if (!this.props.items) {
        return { fill: '#FFFFFF', stroke: '#000000' };
      }
      const vons = R.uniq(R.map((item) => item.Von, this.props.items));
      const field = R.length(vons) === 1 ? 'Nach' : 'Von';
      const itemForFeature = R.find((item) => item[field] === title, this.props.items);
      if (!itemForFeature) {
        return { fill: '#FFFFFF', stroke: '#000000' };
      }
      const value = parseInt(itemForFeature.Wert, 10);
      const colorProvider = this.pickColor;
      return { fill: colorProvider(value), stroke: '#000000' };
    }
  }

  private pickColor(value: number): string {
    if (value === 0) {
      return this.neutral_color;
    } else if (value > 0) {
      const [min, max] = this.getMinMax();
      const positive = d3.scaleQuantize<string>().domain([1, max]).range(this.colors);
      return positive(value);
    } else if (value < 0) {
      const [min, max] = this.getMinMax();
      const negative = d3.scaleQuantize<string>().domain([1, -min]).range(this.negative_colors);
      return negative(-value);
    }
    return this.neutral_color;
  }

  private getMinMax(): [number, number] {
    let max = 0;
    let min = 0;
    if (this.props.items) {
      let normalizedData = R.reject((item) => item.Von === item.Nach, this.props.items);
      max = R.reduce((acc, item) => R.max(acc, item.Wert), Number.MIN_VALUE, normalizedData);
      min = R.reduce((acc, item) => R.min(acc, item.Wert), Number.MAX_VALUE, normalizedData);
    }
    return [min, max];
  }
}
