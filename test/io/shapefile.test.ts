import R from "ramda"
import * as shapefile from "shapefile"
import fs from "fs"
import proj4 from 'proj4';

let file = "./testdata/ot.shp"

test('Load shapefile as geojson',(done)=>{
    let [srcProj,dstProj] = [fs.readFileSync(file.replace('.shp','.prj')).toString(),proj4.defs('EPSG:4326').datum!]
    shapefile.read(file,file.replace('.shp','.dbf'),{encoding:'UTF-8'}).then((data) => {         
        expect(srcProj).toContain("PROJCS[\"ETRS_1989")
        expect(proj4(srcProj,dstProj,[1,1])).toEqual([-1073447.625769634, 113937.0321468359])
        expect(R.length(data.features)).toEqual(63)        
        expect(R.keys(R.head(data.features)!.properties)).toEqual(["OT","Name"])        
        done()        
    })
})