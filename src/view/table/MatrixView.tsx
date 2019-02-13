import React from 'react'
import R from 'ramda'
import LinkView from './LinkView'
import Tabledata from '../../model/Tabledata'
import { Table, Column, Cell, SelectionModes } from '@blueprintjs/table';

export interface MatrixViewProps {
    fields: string[],
    tabledata: Tabledata
    onLabelSelect: (label:string) => void
    onIdSelect: (id:string) => void
}

interface MatrixViewState {

}

export default class MatrixView extends React.Component<MatrixViewProps,MatrixViewState>{

    constructor(props: MatrixViewProps){
        super(props)
        this.onLabelSelect = this.onLabelSelect.bind(this)
        this.onIdSelect = this.onIdSelect.bind(this)
    }

    private onLabelSelect(label:string){
        this.props.onLabelSelect(label)
    }

    private onIdSelect(id:string){
        this.props.onIdSelect(id)
    }    

    render():JSX.Element{                    
            let cellRenderer = (rowNum: number, colNum: number) => {              
                let val = this.props.tabledata.getValueAt(rowNum,colNum)
                return <Cell key={rowNum+":"+colNum}>{val}</Cell>
            }
            let createColumn = (column:number) => {
                let col = column
                let columnName = isNaN(column)?"":column.toString()
                return <Column key={col} name={columnName} cellRenderer={cellRenderer}/>
            }
            let columns = R.map(createColumn,R.range(0,this.props.tabledata.getColumnCount()))
            let matrixUI =  <Table defaultColumnWidth={50} 
                  numRows={this.props.tabledata.getRowCount()} 
                  //bodyContextMenuRenderer={this.renderBodyContextMenu}
                  selectionModes={SelectionModes.ALL}
                  //onSelection={this.updateDiagram.bind(this)}
                  >
             {columns}
           </Table>
        return <div>
            <LinkView fieldNames={this.props.fields} onLabelSelect={this.onLabelSelect} onIdSelect={this.onIdSelect}/>
            <div style={{width:"1600px", height:"400px", overflow:'auto'}}>
                {matrixUI}
            </div>   
        </div>
    }

}