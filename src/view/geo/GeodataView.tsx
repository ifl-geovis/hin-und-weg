import React from "react"
import FileInput from '../input/FileInput'
import AttributeView from "./AttributeView"
import MapView from "./MapView"
import Panel from "../Panel"

export interface GeodataProps {

}

export default class GeodataView extends React.Component<GeodataProps>{
    
    constructor(props:GeodataProps){
        super(props)        
        this.shpFileSelected = this.shpFileSelected.bind(this)        
    }    

    public shpFileSelected(file:File){
        console.log(`Shapefile ${file.path} selected.`)
    }

    public render():JSX.Element{
       return (
        <Panel>
            <FileInput label="Shape Datei auswählen..." fileSelected={this.shpFileSelected} disabled={false}/>    
            <MapView/>
            <AttributeView/>
        </Panel>        
       ) 
    }
  }