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
        this.shpFilesSelected = this.shpFilesSelected.bind(this)        
    }    

    //HINT: In the moment we support only one geodata file for selection
    public shpFilesSelected(fileList:FileList){
        this.props.onSelectGeodata(fileList[0])    
    }

    public render():JSX.Element{
        let attributes:GeoJsonProperties[] = []
        if(this.props.geodata!=null){
            attributes=this.props.geodata.attributes()
        }
       return (
        <div>
            <FileInput label="Shape Datei auswählen..." filesSelected={this.shpFilesSelected} disabled={false}/>    
            <MapView geodata={this.props.geodata}/>
            <AttributeView attributes={attributes}/>
        </div>        
       ) 
    }
  }