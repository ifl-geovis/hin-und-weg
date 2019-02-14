import React from "react"
import R from 'ramda'
import Tabledata from "../../model/Tabledata"

export interface LegendProps {
    tabledatas: { [name: string] : Tabledata}
}

export default class LegendView extends React.Component<LegendProps>{
    
    constructor(props:LegendProps){
        super(props)                       
    }    
  
    public render():JSX.Element{
       return (
        <div>
            <svg width="500" height="250">
                <text transform="translate(250,125)">Legend for {R.length(R.keys(this.props.tabledatas))} Datensätze.</text>
            </svg>
        </div>   
       ) 
    }
}
