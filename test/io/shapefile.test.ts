import R from "ramda"
import * as shapefile from "shapefile"
import { FeatureCollection,Geometry } from "geojson"

let file = "./testdata/ot_wgs84.shp"

test('Load shapefile as geojson',(done)=>{
    shapefile.read(file,file.replace('.shp','.dbf'),{encoding:'UTF-8'}).then((features) => { 
        expect(features.features).toHaveLength(63)        
        expect(R.keys(features.features[0].properties)).toEqual([""])
        done()        
    })
})