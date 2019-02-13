import React from "react"
import FileInput from '../input/FileInput'
import TabMatrixView from "./TabMatrixView"
import Panel from "../Panel"
import Tabledata from '../../model/Tabledata';

export interface TabledataViewProps {
    geoFieldNames: string[],
    tabledatas: { [id:string]: Tabledata }
    onSelectTabledataId: (selected:string) => void
    onSelectTabledataFile: (file:File) => void
}

interface TabledataViewState {
    
}

export default class TabledataView extends React.Component<TabledataViewProps,TabledataViewState>{
    
    constructor(props:TabledataViewProps){
        super(props)        
        this.csvFileSelected = this.csvFileSelected.bind(this) 
        this.onSelectTableDataId = this.onSelectTableDataId.bind(this)                         
    }    

    private csvFileSelected(file:File){
        this.props.onSelectTabledataFile(file)
    }

    private onSelectTableDataId(selectedId:string){
        this.props.onSelectTabledataId(selectedId)
    }

    public render():JSX.Element{
       return (
        <Panel>
            <FileInput label="CSV Datei auswählen..." fileSelected={this.csvFileSelected} disabled={false}/>    
            <TabMatrixView fieldNames={this.props.geoFieldNames} tabledatas={this.props.tabledatas} onSelectTableDataId={this.onSelectTableDataId}/>
        </Panel>        
       ) 
    }
  }