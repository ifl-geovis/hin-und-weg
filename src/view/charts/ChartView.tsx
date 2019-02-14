import React from 'react'
import Tabledata from '../../model/Tabledata'

export interface ChartViewProps {
  tabledatas: { [name: string] : Tabledata} 
  type: string | null
}

export default class ChartView extends React.Component<ChartViewProps>{    

    constructor(props:ChartViewProps){
        super(props)                
    }    

    render():JSX.Element {
        return (<svg width="500" height="500"><text transform="translate(250,250)">{this.props.type==null?'Kein':this.props.type}</text></svg>)
     }      
}
