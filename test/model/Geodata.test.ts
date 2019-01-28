import * as Debug from '../../src/debug'
import Geodata from '../../src/model/Geodata'

Debug.off()
describe('Load shapefile and provide geojson data',() => {
    
    test('Shapefile is loaded',(done) => {
        Geodata.read('./testdata/ot_wgs84.shp',(data:Geodata) => {
            expect(data.count()).toEqual(63)          
            //expect(R.length(data.fields())).toEqual(2)
            done()
        })
    })
})