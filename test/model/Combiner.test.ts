import { expect } from "chai"
import * as Debug from '../../src/debug'
import Combiner from '../../src/model/Combiner'
import Geodata from '../../src/model/Geodata'
import Tabledata from '../../src/model/Tabledata'

Debug.on()

describe('Combiner takes Geodata and OLAP Data and combines Geodata fields and Matrix cells',() => {

    it('Takes geodata and tabledata and selects tabledata by geodata selector (and id)',(done) => {
        Tabledata.read('./testdata/201512_OT_4_2a_Bereinigt.csv',(tabledata:Tabledata) => {
            Geodata.read('./testdata/ot.shp',(geodata:Geodata) => {
                let combiner = new Combiner(geodata,tabledata.getOLAPMatrixFor('Jahr','2015','Von','Nach'))
                expect(combiner).not.equal(null)
                combiner.setGeodataId('OT')   
                combiner.setGeodataSelector('Name') 
                expect(combiner.getValueFor(['Von','Seehausen'],['Nach','Zentrum-Nordwest'])).equal('5')       
                expect(combiner.getValueFor(['Von','Leutzsch'],['Nach','Gohlis-Mitte'])).equal('4')     
                done()
            })     
        })          
    })

    it('Provides geodataId and geodataSelector',(done) => {
        Tabledata.read('./testdata/201512_OT_4_2a_Bereinigt.csv',(tabledata:Tabledata) => {
            Geodata.read('./testdata/ot.shp',(geodata:Geodata) => {
                let combiner = new Combiner(geodata,tabledata.getOLAPMatrixFor('Jahr','2015','Von','Nach'))
                expect(combiner).not.equal(null)
                combiner.setGeodataId('OT')   
                combiner.setGeodataSelector('Name') 
                expect(combiner.getGeodataId()).equal('OT')        
                expect(combiner.getGeodataSelector()).equal('Name')                            
                done()
            })     
        })          
    })
})