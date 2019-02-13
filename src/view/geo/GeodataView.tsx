import React from "react"
import FileInput from '../input/FileInput'
import AttributeView from "./AttributeView"
import MapView from "./MapView"
import Geodata from '../../model/Geodata'
import { GeoJsonProperties } from 'geojson';

export interface GeodataProps {
    geodata: Geodata | null
    onSelectGeodata: (file:File) => void
}

export default class GeodataView extends React.Component<GeodataProps>{
    
    constructor(props:GeodataProps){
        super(props)        
        this.shpFileSelected = this.shpFileSelected.bind(this)        
    }    

    public shpFileSelected(file:File){
        this.props.onSelectGeodata(file)    
    }

    public render():JSX.Element{
        let attributes:GeoJsonProperties[] = []
        if(this.props.geodata!=null){
            attributes=this.props.geodata.attributes()
        }
       return (
        <div>
            <FileInput label="Shape Datei auswählen..." fileSelected={this.shpFileSelected} disabled={false}/>    
            <MapView geodata={this.props.geodata}/>
            <AttributeView attributes={attributes}/>
        </div>        
       ) 
    }
  }