import { expect } from "chai"
import R from "ramda"
import * as Debug from '../../src/debug'
import Geodata from '../../src/model/Geodata'

Debug.on()
describe('Load shapefile and provide geojson data',() => {
    
    it('Shapefile is loaded',(done) => {
        Geodata.read('./testdata/ot.shp',(data:Geodata) => {
            expect(data.count()).equal(63)          
            expect(R.length(data.fields())).equal(2)
            expect(data.fields()).eql(["OT","Name"])
            done()
        })
    })

    it('Iterate trough data and check values (geometry and properties)',(done) => {       
        Geodata.read('./testdata/ot.shp',(data:Geodata) => {        
            for(let index of R.range(0,data.count())){
                expect(data.getGeometryOf(index)).not.equal(null)
                expect(data.getValueFor(index,'Name')).not.equal(null)
                expect(data.getValueFor(index,'OT')).not.equal(null)
            }              
            done()
        })
    });
    
})