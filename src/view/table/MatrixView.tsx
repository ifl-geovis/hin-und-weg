import React from 'react'
import R from 'ramda'
import LinkView from './LinkView'
import Tabledata from '../../model/Tabledata'
import Geodata from '../../model/Geodata'
import { Table, Column, Cell, SelectionModes, RenderMode, RowHeaderCell } from '@blueprintjs/table';

export interface MatrixViewProps {
    fields: string[],
    tabledata: Tabledata,
    geodata: Geodata | null
    onLabelSelect: (label:string) => void
    onIdSelect: (id:string) => void
}

interface MatrixViewState {
    idField: string | null
    nameField: string | null
}

export default class MatrixView extends React.Component<MatrixViewProps,MatrixViewState>{

    constructor(props: MatrixViewProps){
        super(props)
        this.onLabelSelect = this.onLabelSelect.bind(this)
        this.onIdSelect = this.onIdSelect.bind(this)
        this.state = {
            idField: null,
            nameField: null
        }
    }

    private onLabelSelect(label:string){
        this.props.onLabelSelect(label)
        this.setState({nameField: label})
    }

    private onIdSelect(id:string){
        this.props.onIdSelect(id)
        this.setState({idField: id})
    }    

    render():JSX.Element{                    
            let cellRenderer = (rowNum: number, colNum: number) => {                            
                let val = this.props.tabledata.getValueAt(rowNum+1,colNum+1)                                
                return <Cell key={rowNum+":"+colNum}>{val}</Cell>
            }
            let rowHeaderCellRenderer = (rowIndex: number ) => {
                let val = this.props.tabledata.getValueAt(rowIndex+1,0)                 
                val = val.substring(val.length-2,val.length)                                       
                if(this.props.geodata && this.state.idField && this.state.nameField){
                    let feature = this.props.geodata.getFeatureByFieldValue(this.state.idField,val)                    
                    if(feature){
                        
                        val = feature.properties![this.state.nameField]                        
                    }else{
                        console.log(`Feature not found for rowIndex: ${rowIndex} and val ${val}`)
                    }
                }                  
                return <RowHeaderCell>{val}</RowHeaderCell>
            }
            let createColumn = (column:number) => {
                if(this.props.geodata && this.state.idField && this.state.nameField){
                    let val = this.props.tabledata.getValueAt(0,column+1)   
                    val = val.substring(val.length-2,val.length)                                          
                    let feature = this.props.geodata.getFeatureByFieldValue(this.state.idField,val)
                    if(feature){
                        let columnName=feature.properties![this.state.nameField]                       
                        return <Column key={column} name={columnName} cellRenderer={cellRenderer}/>
                    }
                }
                let col = column
                let columnName = isNaN(column)?"":column.toString()
                return <Column key={col} name={columnName} cellRenderer={cellRenderer}/>                                                
            }
            let columns = R.map(createColumn,R.range(0,this.props.tabledata.getColumnCount()-1))
            let matrixUI =  <Table renderMode={RenderMode.BATCH} rowHeaderCellRenderer={rowHeaderCellRenderer} 
                  numRows={this.props.tabledata.getRowCount()-1} 
                  //bodyContextMenuRenderer={this.renderBodyContextMenu}
                  selectionModes={SelectionModes.ALL}
                  //onSelection={this.updateDiagram.bind(this)}
                  >
             {columns}
           </Table>
        return <div>
            <LinkView fieldNames={this.props.fields} onLabelSelect={this.onLabelSelect} onIdSelect={this.onIdSelect}/>
            <div style={{width:"1400px", height:"300px", overflow:'auto'}}>
                {matrixUI}
            </div>   
        </div>
    }

}