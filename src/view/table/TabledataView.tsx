import React from "react"
import FileInput from '../input/FileInput'
import TabMatrixView from "./TabMatrixView"
import Panel from "../Panel"

export interface TabledataProps {

}

export default class TabledataView extends React.Component<TabledataProps>{
    
    constructor(props:TabledataProps){
        super(props)        
        this.csvFileSelected = this.csvFileSelected.bind(this)        
    }    

    public csvFileSelected(file:File){
        console.log(`${file.path} selected.`)
    }

    public render():JSX.Element{
       return (
        <Panel>
            <FileInput label="CSV Datei auswählen..." fileSelected={this.csvFileSelected} disabled={false}/>    
            <TabMatrixView/>
        </Panel>        
       ) 
    }
  }