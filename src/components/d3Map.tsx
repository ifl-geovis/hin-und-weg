import React from 'react'
import { FeatureCollection } from 'geojson'
import * as d3 from 'd3'
import Geodata from '../model/Geodata'

interface D3MapProps {

}

interface D3MapState {
    data: FeatureCollection|null
}

export class D3Map extends React.Component<D3MapProps,D3MapState> {   

    constructor(props:D3MapProps){
        super(props)
        Geodata.read('./testdata/ot.shp',(data: Geodata) => {
            this.setState({ data: data.data})
        })        
        this.state = { data: null}
    }   
    
    render(){
        if(this.state.data!=null){
            let projection = d3.geoMercator()
            let path = d3.geoPath().projection(projection)
            let style={stroke: '#ff0000'}
            let features = this.state.data.features.map((feature) => {
                let key:string= feature.properties?feature.properties['OT']: ''
                //let changedFeature = 
                return <path d={path(feature)||undefined} style={style} key={key}/>
            })
            return(
                <svg width="500px" height="500px">
                    <g className="map">{features}</g>              
                </svg>
            ) 
        }else{
            return <span>Keine Daten geladen</span>
        }   
    }
}