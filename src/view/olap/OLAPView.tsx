import React from 'react'
import R from 'ramda'
import Cubus, { Query,Result} from 'cubus'
import Combiner from '../../model/Combiner'
import Geodata from '../../model/Geodata';

export interface OLAPViewProps<T> {
    cubus: Cubus<T>   
    geodata: Geodata      
}

interface OLAPViewState {

}

export default class OLAPView<T> extends React.Component<OLAPViewProps<T>,OLAPViewState>{

    constructor(props:OLAPViewProps<T>){
        super(props)
    }

    render(){
        
        let year2015data = this.props.cubus.query({'Jahr':['2015']})                
        console.log(year2015data)
        // propery.name ('Von') property.value ('10000')
        // value = 
        //TODO: Get all years, and from, tos for query
        let locationIds = R.map(result => R.find((item) => item['name'] === 'Von',result.property)!.value ,year2015data) 
        locationIds = R.uniq(R.map(locationId => locationId.substring(3,6),locationIds))
        let locationNames = R.map(locationId => this.props.geodata.getFeatureByFieldValue('OT',locationId).properties!['Name'],locationIds)              
        
        let values = R.map(item => item.value,year2015data)
        return (
            <div>Data for {R.join(', ',locationNames)} in 2015: {R.join(', ',values)}</div>
        )
    }
}

