import R from 'ramda'
import React from "react"
import FileInput from '../input/FileInput'
import TabMatrixView from "./TabMatrixView"
import Tabledata from '../../model/Tabledata'
import Geodata from '../../model/Geodata'

export interface TabledataViewProps {
    geodata: Geodata | null
    geoFieldNames: string[],
    tabledatas: { [id:string]: Tabledata }
    onSelectTabledataId: (selected:string) => void
    onSelectTabledataFiles: (fileList:FileList) => void
}

interface TabledataViewState {
    nameField: string 
    idField: string    
}

export default class TabledataView extends React.Component<TabledataViewProps,TabledataViewState>{
    
    constructor(props:TabledataViewProps){
        super(props)        
        this.onCSVFilesSelected = this.onCSVFilesSelected.bind(this) 
        this.onSelectTableDataId = this.onSelectTableDataId.bind(this)  
        this.onIdSelect = this.onIdSelect.bind(this) 
        this.onNameSelect = this.onNameSelect.bind(this)            
        this.state = {
            nameField: (R.nth(0,props.geoFieldNames)?R.nth(0,props.geoFieldNames)!:"Auswählen"),
            idField: (R.nth(1,props.geoFieldNames)?R.nth(1,props.geoFieldNames)!:"Auswählen"),            
        }              
    }    

    private onCSVFilesSelected(fileList:FileList){
        this.props.onSelectTabledataFiles(fileList)
    }

    private onSelectTableDataId(selectedId:string){
        this.props.onSelectTabledataId(selectedId)
    }   

    private onNameSelect(name:string){        
        this.setState({nameField: name})
    }

    private onIdSelect(id:string){       
        this.setState({idField: id})
    }    
  
    public render():JSX.Element{
       return (
        <div>           
            <FileInput label="CSV Dateien auswählen..." filesSelected={this.onCSVFilesSelected} disabled={false}/>                
            <TabMatrixView idField={this.state.idField} nameField={this.state.nameField} geodata={this.props.geodata} tabledatas={this.props.tabledatas} onSelectTableDataId={this.onSelectTableDataId}/>
        </div>        
       ) 
    }
  }