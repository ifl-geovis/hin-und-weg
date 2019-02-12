
import * as Debug from '../../src/debug'
import Combiner from '../../src/model/Combiner'
import Geodata from '../../src/model/Geodata'
import Tabledata from '../../src/model/Tabledata'

Debug.on()

interface CombinerView {

}

export default class CombinerController {

    private geodata: Geodata | null
    private tabledata: Tabledata | null
    private view: CombinerView = {}

    constructor(){
        this.geodata =  null
        this.tabledata = null
    }

    public setView(view: CombinerView){
        this.view = view        
        // setup callbacks
    }

    public setGeodata(geodata:Geodata){
        this.geodata = geodata
        // update features
        /*
        this.view.setFeatures()
        */
    }

    public chooseGeodata(filepath: string){
        Geodata.read(filepath,this.setGeodata)
    }

    public setTabledata(tabledata:Tabledata){
        this.tabledata = tabledata
        // update data for table
        /*
        this.view.setColumnNames()
        this.view.setRowNames()
        this.view.setCells()
        */
    }

    public chooseTabledata(filepath: string){
        Tabledata.read(filepath,this.setTabledata)
    }
}