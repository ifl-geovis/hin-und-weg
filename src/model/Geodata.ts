import * as shapefile from 'shapefile'
import R from 'ramda'
import {FeatureCollection,Geometry, Feature} from 'geojson'
import * as Debug from '../debug'
import assert from 'assert'

Debug.on()
export default class Geodata {

    featureCollection: FeatureCollection<Geometry>
    
    private static createGeodata = function(features: FeatureCollection<Geometry>): Geodata {        
        return new Geodata(features)
    }

    public static read(path: string,callback: (data: Geodata) => void){
        shapefile.read(path,path.replace('.shp','.dbf'),{encoding:"UTF-8"})
            .then((data) => {
                /*Proj4.defs('EPSG:3006','+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
                let newPoint = Proj4.transform(Proj4.Proj('EPSG:3006'),Proj4.Proj("EPSG:4326"),point)
                console.log(newPoint.x)
                console.log(newPoint.y)*/
                callback(Geodata.createGeodata(data))
            }).catch(console.error)        
    }

    constructor(featureCollection: FeatureCollection<Geometry>){
        this.featureCollection = featureCollection        
    }
    
    public count(): number {                
        return R.length(this.featureCollection.features)
    }

    public fields(): string[] {
        assert(R.not(R.isEmpty(this.featureCollection.features)),"data.features is empty")
        let first = R.head(this.featureCollection.features)!      
        return R.keys(first.properties)
    }

    public getGeometryOf(index: number): Geometry {
        return this.getFeatureOf(index).geometry
    }

    public getFeatureOf(index: number): Feature {
        assert(this.featureCollection && this.featureCollection.features,"There has to be at least on feature")
        assert(index >= 0  && index < this.count(),"Index should be between 0 and "+this.count())
        return this.featureCollection.features[index]
    }

    public getValueFor(index: number,key: string): number| string| null {
        let props = this.getFeatureOf(index).properties
        if(props && props[key]){
            return props[key]
        }
        return null
    }

    public getFeatureByFieldValue(fieldName: string,fieldValue: string|number): Feature {
        return R.find((feature:Feature) => feature.properties![fieldName] === fieldValue,this.featureCollection.features)!
    }
}
