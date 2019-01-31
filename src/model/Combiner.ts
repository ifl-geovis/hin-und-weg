import R from 'ramda'
import Geodata from '../../src/model/Geodata'
import Cubus from 'cubus'

export default class Combiner {

    geodata: Geodata
    cubus: Cubus<string>
    geodataId: string = "ID"
    geodataSelector: string = "Name"

    constructor(geodata: Geodata,cubus: Cubus<string>){
        this.geodata = geodata
        this.cubus = cubus
    }

    public setGeodataId(id: string){
        this.geodataId = id 
    }

    public getGeodataId():string {
        return this.geodataId
    }

    public setGeodataSelector(selector: string){
        this.geodataSelector = selector
    }

    public getGeodataSelector():string {
        return this.geodataSelector
    }

    // TODO: How to ensure that numbers like '05' == '5'
    private getCubusKeyFor(selector: string): string {
        let selectedFeature = this.geodata.getFeatureByFieldValue(this.geodataSelector,selector) 
        return ""+parseInt(selectedFeature.properties![this.geodataId])        
    }
    
    public getValueFor(row: [string,string],column: [string,string]): string {        
        let selectedRowKey = this.getCubusKeyFor(row[1])     
        let selectedColumnKey = this.getCubusKeyFor(column[1])
        let query = R.assoc(column[0],[selectedColumnKey],R.assoc(row[0],[selectedRowKey],{}))
        return this.cubus.query(query)[0].value
    }
}