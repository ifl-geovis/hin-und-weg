import * as shapefile from 'shapefile'
import R from 'ramda'
import {FeatureCollection,Geometry, Feature} from 'geojson'
import * as Debug from '../debug'
import assert from 'assert'

Debug.on()
export default class Geodata {

    data: FeatureCollection<Geometry>
    linkField: string | undefined 
    
    private static createGeodata = function(features: FeatureCollection<Geometry>): Geodata {
        return new Geodata(features)
    }

    public static read(path: string,callback: (data: Geodata) => void){
        shapefile.read(path,path.replace('.shp','.dbf'),{encoding:"UTF-8"})
            .then((data) => {
                callback(Geodata.createGeodata(data))
            }).catch(console.error)        
    }

    constructor(data: FeatureCollection<Geometry>){
        this.data = data        
    }

    public getLinkField(): undefined | string {
        return this.linkField
    }

    public setLinkField(name: string): Geodata {
        assert(this.fields().indexOf(name)>-1,`LinkField should be one of the fields ${this.fields()}`)
        this.linkField = name
        return this
    }

    public count(): number {                
        return R.length(this.data.features)
    }

    public fields(): string[] {
        assert(R.not(R.isEmpty(this.data.features)),"data.features is empty")
        let first = R.head(this.data.features)!      
        return R.keys(first.properties)
    }

    public getGeometryOf(index: number): Geometry {
        return this.getFeatureOf(index).geometry
    }

    public getFeatureOf(index: number): Feature {
        assert(this.data && this.data.features,"There has to be at least on feature")
        assert(index >= 0  && index < this.count(),"Index should be between 0 and "+this.count())
        return this.data.features[index]
    }

    public getValueFor(index: number,key: string): number| string| null {
        let props = this.getFeatureOf(index).properties
        if(props && props[key]){
            return props[key]
        }
        return null
    }
}
