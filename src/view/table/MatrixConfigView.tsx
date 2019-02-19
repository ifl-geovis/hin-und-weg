import React from 'react'
import {NumericInput } from '@blueprintjs/core'

export interface MatrixConfigProps {   
    onRowOffsetSelect: (valueAsNumber: number) => void
    onColumnOffsetSelect: (valueAsNumber: number) => void
}

interface MatrixConfigState {
    rowOffset: number
    columnOffset: number
}

export default class MatrixConfigView extends React.Component<MatrixConfigProps,MatrixConfigState>{

    constructor(props: MatrixConfigProps){
        super(props)      
        this.onRowOffsetSelect = this.onRowOffsetSelect.bind(this)
        this.onColumnOffsetSelect = this.onColumnOffsetSelect.bind(this)
        this.state ={
            rowOffset:0,
            columnOffset:0
        }   
    }

    private onRowOffsetSelect(value: number){
        this.props.onRowOffsetSelect(value)
        this.setState({rowOffset: value})
    }

    private onColumnOffsetSelect(value: number){
        this.props.onColumnOffsetSelect(value)
        this.setState({columnOffset: value})
    }

    public render():JSX.Element{       
       return (
        <div>
            <div>Daten starten ab</div>
            <label>Zeile: </label><NumericInput value={this.state.rowOffset} min={0} onValueChange={this.onRowOffsetSelect}></NumericInput>
            <label>Spalte: </label><NumericInput value={this.state.columnOffset} min={0} onValueChange={this.onColumnOffsetSelect}></NumericInput>
        </div>   
       ) 
    }

}