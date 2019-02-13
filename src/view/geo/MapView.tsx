import React from 'react'
import R from 'ramda'
import { Feature } from 'geojson'
import * as d3 from 'd3'
import Geodata from '../../model/Geodata';

export interface MapViewProps {
    geodata: Geodata | null
}

interface MapViewState {
    width: number
    height: number    
}

export default class MapView extends React.Component<MapViewProps,MapViewState>{
    
    constructor(props:MapViewProps){
        super(props)               
        this.state = {
            width: 300,
            height: 300
        }   
    }      

    private createD3Map():object[]{
        let geodata = this.props.geodata
        if(geodata==null) return [<g key="no-geodata"><text transform={"translate("+this.state.width/2+","+this.state.height/2+")"} style={{ fill:'#000000', stroke: '#aaaaaa'}}>Keine Geodaten geladen</text></g>] 
        let projection = d3.geoMercator().fitSize([this.state.width,this.state.height],geodata.featureCollection)                           
        let path = d3.geoPath().projection(projection)            
        let indexedMap = R.addIndex(R.map)
        let features = indexedMap( (feature,id:number):JSX.Element => {           
            let f = feature as Feature
            let style = {fill:`#eeeeee`,stroke:'#000000'}
            let center = d3.geoCentroid(f)
            let firstProp = R.head(R.keys(f.properties!))                
            let name = R.prop(firstProp!,f.properties!)
            return (
                <g key={name}>
                    <path  d={path(f)||undefined} style={style} key={id}/>
                    <text transform={"translate("+projection(center)+")"} style={{ fill:'#000000', stroke: '#000000'}}>{name}</text>   
                </g>                     
            )
        },geodata.featureCollection.features)
        return features
    }
    
    public render():JSX.Element {
       return (
        <svg width={this.state.width} height={this.state.height}>                                      
            {this.createD3Map()}    
        </svg>        
       ) 
    }
  }