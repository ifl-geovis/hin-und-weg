import R from 'ramda'
import assert from 'assert'
import fs from 'fs'
import Cubus from 'cubus'
import { Column } from '@blueprintjs/table';

export default class Tabledata {

    private data: string[][]
    
    private static createTabledata = function(err:NodeJS.ErrnoException,data:string): Tabledata {        
        let rows = R.reject(R.isEmpty,data.split(/\n|\r\n/)) as string[]        
        let cells = R.map(R.split(/;|,|:/),rows)        
        return new Tabledata(cells)
    }

    public static read(path: string,callback: (data: Tabledata) => void){
        fs.readFile(path,{encoding:"UTF-8"},R.pipe(Tabledata.createTabledata,callback))
    }

    constructor(data: string[][]){     
        this.data = data           
    }

    public getCellCount():number {
        return this.getRowCount()*this.getColumnCount()
    }

    public getRowCount():number {
        return this.data.length
    }

    public getColumnCount():number {
        return this.data[0].length
    }

    public getRowAt(index: number): string[]{
        return this.data[index]
    }

    public getColumnAt(index: number): string[]{
        let nth = (row: string[]): string => {
            return R.defaultTo("",R.nth(index,row))
        }
        return R.map(nth,this.data)        
    }

    public getValueAt(rowIndex: number,columnIndex: number): string {
        return R.defaultTo("",R.nth(columnIndex,this.getRowAt(rowIndex)))
    }

    public getTabledataBy(rowStartEnd: [number,number],columnStartEnd: [number,number]): Tabledata {
        let cells = new Array<Array<string>>()
        for(let rowIndex=rowStartEnd[0];rowIndex<rowStartEnd[1];rowIndex++){
            let row = new Array<string>()
            for(let columnIndex=columnStartEnd[0];columnIndex<columnStartEnd[1];columnIndex++){
                row = R.append(this.getValueAt(rowIndex,columnIndex),row)
            }
            cells = R.append(row,cells)
        }
        return new Tabledata(cells)
    }

    public getCubusMatrixFor(tableName: string,tableValue: string,rowName:string, columnName: string): Cubus<string> {
        let rowKeys = R.tail(this.getRowAt(0))
        let columnKeys = R.tail(this.getColumnAt(0))
        let matrixTable = this.getTabledataBy([1,this.getRowCount()],[1,this.getColumnCount()])
        
        let dimensions = [tableName,rowName,columnName]
        let cubus = new Cubus<string>(dimensions)
        cubus.addDimensionValue(tableName,tableValue)
        R.forEach(row => cubus.addDimensionValue(rowName,row),rowKeys)
        R.forEach(column => cubus.addDimensionValue(columnName,column),columnKeys)            
        R.forEach(row => {
            R.forEach(column => {                
                let value = matrixTable.getValueAt(rowKeys.indexOf(row),columnKeys.indexOf(column))
                let address = R.assoc(columnName,column,R.assoc(rowName,row,R.objOf(tableName,tableValue)))
                cubus.add(value,address)
            },columnKeys)
        },rowKeys)       
        return cubus
    }
}