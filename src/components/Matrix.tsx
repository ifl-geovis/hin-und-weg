import React from "react"
import R from "ramda"
import {Matrix,CSVMatrix} from "../model/Matrix"
import {FileInput,Menu, Label, ControlGroup, NumericInput} from "@blueprintjs/core"
import {Table,Column, Cell,IRegion,SelectionModes,IMenuContext,Utils} from '@blueprintjs/table'
import {HTMLSelect, Card, Elevation} from '@blueprintjs/core'
import ReactEcharts from 'echarts-for-react'
import { ECharts, EChartOption } from 'echarts'

interface MatrixState {
    matrix: Matrix | null,
    lineSeparator: RegExp,
    columnSeparator: RegExp,
    rowOffset: number,
    columnOffset: number,
}

export interface MatrixProps { }

export class MatrixUI extends React.Component<MatrixProps,MatrixState> {

    diagramOptions = {
        title: {
            text: 'Diagramm zu den Tabellendaten:'
        },
        tooltip: {},
        legend: {
            data:['']
        },
        xAxis: {
            data: [0]
        },
        yAxis: {},
        series: [{
            name: '',
            type: 'line',
            data: [0]
        }]
    }
    
    constructor(props: MatrixProps){
        super(props)
        this.handleFile = this.handleFile.bind(this)
        this.setColumnSeparator  = this.setColumnSeparator.bind(this)
        this.setLineSeparator  = this.setLineSeparator.bind(this)
        this.renderBodyContextMenu = this.renderBodyContextMenu.bind(this)
        this.showDiagram = this.showDiagram.bind(this)

        this.state = {
            matrix: null,
            lineSeparator: new RegExp("\n"),
            columnSeparator: new RegExp("\s*,\s*"),          
            rowOffset: 1,
            columnOffset: 1,
        }
    }

    handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        if(event.target.files !=null && event.target.files.length > 0){
            let newMatrix =  new CSVMatrix(event.target.files[0].path)
            this.setState( { matrix: newMatrix })           
        }   
    }

    setColumnSeparator(event: React.ChangeEvent<HTMLSelectElement>) {
        if(event.target.value!=null){
            let regexValue = new RegExp(event.target.value)            
            this.setState( { columnSeparator: regexValue})
        }
    }

    setLineSeparator(event: React.ChangeEvent<HTMLSelectElement>) {
        if(event.target.value!=null){
            let regexValue = new RegExp(event.target.value)      
            this.setState({ lineSeparator: regexValue})            
        }
    }

    setRowOffset(valueAsNumber: number){
        if(valueAsNumber!=null){            
            this.setState({ rowOffset: valueAsNumber})
        }        
    }

    setColumnOffset(valueAsNumber: number){
        if(valueAsNumber!=null){            
            this.setState({ columnOffset: valueAsNumber})
        } 
    }

    showDiagram(event: React.MouseEvent<HTMLElement>){
        console.log("Show Diagram called.")
    }

    updateDiagram(selectedRegions: IRegion[]){
        if(R.not(R.isEmpty(selectedRegions))){
            let region:IRegion = selectedRegions[0]            
            let matrix = this.state.matrix 
            if(region && matrix){               
               if(region.cols){
                 let diagram = this.refs.diagram as any
                 let chart:ECharts = diagram.getEchartsInstance()
                 this.diagramOptions.legend.data = []
                 this.diagramOptions.series = []
                 for(var col=region.cols[0];col<=region.cols[1];col++){
                    let values = matrix.getColumnAt(col)
                    if(col==region.cols[0]){
                      this.diagramOptions.xAxis.data = R.range(0,values.length)
                    }                      
                    this.diagramOptions.legend.data.push(`Spalte ${col}`)
                    this.diagramOptions.series.push({
                         name: `Spalte ${col}`,
                         type: 'line',
                         data: values
                    })
                 }  
                 chart.clear()     
                 chart.setOption(this.diagramOptions as EChartOption,false,false)
               }

               if(region.rows){
                    let diagram = this.refs.diagram as any
                    let chart:ECharts = diagram.getEchartsInstance()
                    this.diagramOptions.legend.data = []
                    this.diagramOptions.series = []
                    for(var row=region.rows[0];row<=region.rows[1];row++){
                        let values = matrix.getRowAt(row)
                        if(row==region.rows[0]){
                            this.diagramOptions.xAxis.data = R.range(0,values.length)
                        }                      
                        this.diagramOptions.legend.data.push(`Reihe ${row}`)
                        this.diagramOptions.series.push({
                            name: `Reihe ${row}`,
                            type: 'line',
                            data: values
                        })
                     }        
                     chart.clear()     
                     chart.setOption(this.diagramOptions as EChartOption,false,false)
              }
            }
        }
    }

    renderBodyContextMenu(context: IMenuContext){
        let regions = context.getSelectedRegions()
        if(R.not(R.isEmpty(regions))){
            let region:IRegion = regions[0]            
            let matrix = this.state.matrix 
            if(region && matrix){               
               if(region.cols){
                    console.log(`Column ${region.cols[0]}: ${matrix.getColumnAt(region.cols[0])}`)
               }
            }
        }
        return (
            <Menu>
               <Menu.Item icon="blank" onClick={this.showDiagram} text="Als Diagram anzeigen" />
            </Menu>
        )
    }

    render(){        
        var matrixUI = null 
        if (this.state.matrix != null) {
            let matrix = this.state.matrix
            let cellRenderer = (rowNum: number, colNum: number) => {
                let row = rowNum+this.state.rowOffset
                let col = colNum+this.state.columnOffset
                let val = matrix.getValueAt(row,col)
                return <Cell key={row+":"+col}>{isNaN(val)?"":val.toString()}</Cell>
            }
            let createColumn = (column:number) => {
                let col = column
                let columnName = isNaN(column)?"":column.toString()
                return <Column key={col} name={columnName} cellRenderer={cellRenderer}/>
            }
            let columns = R.map(createColumn,R.range(this.state.columnOffset,matrix.getColumnCount()+1))
            matrixUI = 
           <Table defaultColumnWidth={50} 
                  numRows={matrix.getRowCount()-this.state.rowOffset+1} 
                  bodyContextMenuRenderer={this.renderBodyContextMenu}
                  selectionModes={SelectionModes.ALL}
                  onSelection={this.updateDiagram.bind(this)}>
             {columns}
           </Table>
        }
        return (
                <div>                
                    <FileInput disabled={false} text="CSV Datei aufrufen ..." onInputChange={this.handleFile} />                                           
                    <ReactEcharts ref="diagram" option={this.diagramOptions} className='echarts-for-echarts' />                    
                    <div>
                            <Label className="bp3-inline">Spaltentrenner:
                                <HTMLSelect onChange={this.setColumnSeparator}>
                                            <option value=";">;</option>
                                            <option value=",">,</option>
                                            <option value="|">|</option>
                                    </HTMLSelect>
                            </Label>
                        </div>
                        <div>
                            <Label className="bp3-inline">Zeilentrenner:
                                <HTMLSelect onChange={this.setLineSeparator}>
                                    <option value="\n">Unix</option>
                                    <option value="\r\n">Windows</option>
                                </HTMLSelect>            
                            </Label>     
                        </div>                                         
                        {matrixUI}
                    </div>
        )
    }
}