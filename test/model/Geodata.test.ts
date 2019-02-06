import { expect } from "chai"
import R from "ramda"
import * as Debug from '../../src/debug'
import Geodata from '../../src/model/Geodata'
import { Polygon } from 'geojson';
import * as Proj4 from 'proj4';

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
    })

    it('Recognizes *.prj file and use it as srcProjection description', (done) => {
        Geodata.read('./testdata/ot.shp',(data:Geodata) => {        
            expect(data.projection).equal('PROJCS["ETRS_1989_UTM_Zone_33N",GEOGCS["GCS_ETRS_1989",DATUM["D_ETRS_1989",SPHEROID["GRS_1980",6378137.0,298.257222101]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",500000.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",15.0],PARAMETER["Scale_Factor",0.9996],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]')
            done()
        })
    })

    it('Transformes geodata into WGS 84 projection', (done) => {
        Geodata.read('./testdata/ot.shp',(data:Geodata) => {
            let polygon =data.getFeatureOf(0).geometry as Polygon        
            expect(polygon.coordinates[0][0]).to.deep.equal([ 317483.3169999972, 5691380.912100001 ])
            let wgs84Data = data.transformToWGS84()
            expect(wgs84Data.projection).to.deep.equal(Proj4.WGS84)
            let polygonWGS84 = wgs84Data.getFeatureOf(0).geometry as Polygon        
            expect(wgs84Data.transformToWGS84().projection).to.deep.equal(Proj4.WGS84)
            done()
        })
    })
    
})