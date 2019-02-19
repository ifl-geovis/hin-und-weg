import R from 'ramda'
import Cubus, { Query, Result } from 'cubus'
import Geodata from '../../src/model/Geodata'
import Tabledata from '../../src/model/Tabledata';
import { curveBasis } from 'd3';

export default class Combiner {

    geodata: Geodata
    cubus: Cubus<number> 
    tableDimensions: string[]
    tables: { [name:string]: Tabledata } 
    geodataId: string = "ID"
    geodataSelector: string = "Name"   

    constructor(geodata: Geodata,tableDimensions: string[]){
        this.geodata = geodata        
        this.tables = {}
        this.tableDimensions = tableDimensions
        this.cubus = new Cubus<number>(tableDimensions)
    }  

    public getTableCount(): number {
        return R.length(this.getTableNames())
    }

    public getTableNames(): string[] {
        return R.sort((a,b) => a.localeCompare(b),R.keys(this.tables) as string[])
    }

    public getRowNamesFor(name: string): string[] {       
        return R.map(this.getNameById.bind(this),R.tail(this.tables[name].getColumnAt(0)))
    }

    private getNameById(id:string):string{                 
        let feature = this.geodata.getFeatureByFieldValue(this.getGeodataId(),this.normalizeValue(id))            
        return feature.properties![this.getGeodataSelector()]        
    }

    public getColumnNamesFor(name: string): string[] {
        return R.map(this.getNameById.bind(this),R.tail(this.tables[name].getRowAt(0)))
    }

    public addTable(dimension: string,name: string,table: Tabledata): Combiner {
        this.tables = R.assoc(name,table,this.tables)     

        this.cubus.addDimensionValue(dimension,name)
        if(this.getTableCount()<2){
            R.forEach(rowName => this.cubus.addDimensionValue(dimension[1],rowName),this.getRowNamesFor(name))
            R.forEach(columnName => this.cubus.addDimensionValue(dimension[2],columnName),this.getColumnNamesFor(name))
        }              

        for(let row=1;row<table.getRowCount();row++){                       
            let rowName = this.getNameById(table.getColumnAt(0)[row])
            for(let column=1;column<table.getColumnCount();column++){              
                let columnName = this.getNameById(table.getRowAt(0)[column])
                let value = parseFloat(table.getValueAt(row,column))
                let address = R.objOf(dimension,name)
                address = R.assoc(this.tableDimensions[1],rowName,address)
                address = R.assoc(this.tableDimensions[2],columnName,address)
                this.cubus.add(value,address)
            }
        }           
        return this
    }

    public query(query: Query): Result<number>[] {
        return this.cubus.query(query)
    }

    public setGeodataId(id: string): Combiner{
        this.geodataId = id 
        return this
    }

    public getGeodataId():string {
        return this.geodataId
    }

    public setGeodataSelector(selector: string):Combiner{
        this.geodataSelector = selector
        return this
    }

    public getGeodataSelector():string {
        return this.geodataSelector
    }   
    
    private getCubusKeyFor(selector: string): string {
        let selectedFeature = this.geodata.getFeatureByFieldValue(this.geodataSelector,selector) 
        return ""+parseInt(selectedFeature.properties![this.geodataId])        
    }
    
    protected normalizeValue(value: string): string{
        let newValue = value.substr(-2)
        if(newValue.length==1) return '0'+newValue
        return newValue
    }
    
    public getValueFor(row: [string,string],column: [string,string]): number {        
        let selectedRowKey = this.getCubusKeyFor(row[1])     
        let selectedColumnKey = this.getCubusKeyFor(column[1])
        let query = R.assoc(column[0],[selectedColumnKey],R.assoc(row[0],[selectedRowKey],{}))
        return this.cubus.query(query)[0].value
    }
}