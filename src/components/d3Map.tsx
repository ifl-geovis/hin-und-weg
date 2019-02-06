import R from 'ramda'
import React, { CSSProperties } from 'react'
import { FeatureCollection,Feature, Point } from 'geojson'
import { FileInput } from '@blueprintjs/core'
import * as d3 from 'd3'
import Geodata from '../model/Geodata'

interface D3MapProps {
    //styleByFeature: (feature: Feature) => CSSProperties,
    //idByFeature: (feature:Feature) => string
}

interface D3MapState {
    data: FeatureCollection|null
    title: string|null
    width: number
    height: number
}

export class D3Map extends React.Component<D3MapProps,D3MapState> {   

    constructor(props:D3MapProps){
        super(props)                       
        this.state = { data: null, title: null, width: 640, height: 480}         
    }   

    handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        if(event.target.files !=null && event.target.files.length > 0){
            var file = event.target.files[0]
            Geodata.read(file.path,(data:Geodata) => {
                this.setState({data: data.transformToWGS84().featureCollection, title:  file.path})
            })           
        }   
    }        
    
    render(){        
        if(this.state.data!=null){
            let projection = d3.geoMercator().fitSize([this.state.width,this.state.height],this.state.data)
            let path = d3.geoPath().projection(projection)            
            let indexedMap = R.addIndex(R.map)
            let features = indexedMap( (feature,id:number):JSX.Element => {           
                let f = feature as Feature
                let color = 20+id*2
                let style = {fill:`#aaaa${color}`,stroke:'#000000'}
                let center = d3.geoCentroid(f)
                let firstProp = R.head(R.keys(f.properties!))                
                let name = R.prop(firstProp!,f.properties!)
                return (<g>
                        <path  d={path(f)||undefined} style={style} key={id}/>
                        <text transform={"translate("+projection(center)+")"} style={{ fill:'#ffffff', stroke: '#aaaaaa'}}>{name}</text>   
                        </g>                     
                        )
            },this.state.data.features)
            return(
                <div>       
                    <div>
                        <FileInput disabled={false} fill={true} text="Shape Datei aufrufen ..." onInputChange={this.handleFile.bind(this)} /> 
                    </div> 
                    <div>
                        <svg width={this.state.width} height={this.state.height}>                                      
                            {features}    
                        </svg> 
                    </div>                
                </div>
            ) 
        }else{
            return (   
                <div>       
                    <div>
                        <FileInput disabled={false} fill={true} text="Shape Datei aufrufen ..." onInputChange={this.handleFile.bind(this)} /> 
                    </div>
                    <div>                       
                    </div>    
                </div>                           
            )
        }   
    }
}