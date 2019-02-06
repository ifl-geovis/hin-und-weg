import React from 'react'
import { FeatureCollection } from 'geojson'
import * as d3 from 'd3'
import Panel from './Panel'
import Geodata from '../model/Geodata'
import * as Proj4 from 'proj4'
//import * as reproject from 'reproject'

interface D3MapProps {

}

interface D3MapState {
    data: FeatureCollection|null
}

export class D3Map extends React.Component<D3MapProps,D3MapState> {   


    constructor(props:D3MapProps){
        super(props)                
        Geodata.read('./testdata/ot_wgs84.shp',(data: Geodata) => {          
            this.setState({data:data.featureCollection})
        })        
        this.state = { data: null}
    }   
    
    render(){
        let width=500
        let height=500       
        

        if(this.state.data!=null){
            let projection = d3.geoMercator().fitSize([width,height],this.state.data)
            let path = d3.geoPath().projection(projection)//d3.geoPath().projection(d3.geoTransverseMercator().fitSize([width,height],this.state.data))
            let style={stroke: '#ff0000', fill:'#ffffff'}
            let features = this.state.data.features.map((feature) => {
                let key:string= feature.properties?feature.properties['OT']: ''                
                return <path d={path(feature)||undefined} style={style} key={key}/>
            })
            return(
                <Panel> 
                    <svg width={width} height={height}>                                      
                        <g>{features}</g>                                            
                    </svg>
                </Panel>
            ) 
        }else{
            return <Panel><span>Keine Daten geladen</span></Panel>
        }   
    }
}