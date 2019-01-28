import * as shapefile from 'shapefile'
import R from 'ramda'
import {FeatureCollection,Geometry} from 'geojson'
//import * as Debug from '../debug'
import assert from 'assert'

//Debug.on()
export default class Geodata {

    data: FeatureCollection<Geometry>
    
    private static createGeodata = function(features: FeatureCollection<Geometry>): Geodata {
        console.log(features.features[0].properties)
        return new Geodata(features)
    }

    public static read(path: string,callback: (data: Geodata) => void){
        shapefile.read(path,path.replace('.shp','.dbf'),{encoding:"UTF-8"})
            .then(R.pipe(Geodata.createGeodata,callback))
            .catch(console.error)        
    }

    constructor(data: FeatureCollection<Geometry>){
        this.data = data
    }

    public count(): number {                
        return R.length(this.data.features)
    }

    public fields(): string[] {
        //assert(R.not(R.isEmpty(this.data.features)),"data.features is empty")
        let first = R.head(this.data.features)!   
        console.log(first.properties)         
        return R.keys(first.properties)
    }

}
