import React from "react"

export interface LegendProps {
    
}

export default class LegendView extends React.Component<LegendProps>{
    
    constructor(props:LegendProps){
        super(props)                       
    }    
  
    public render():JSX.Element{
       return (
        <div>
            <p>Insert legend for chart here.</p>
        </div>   
       ) 
    }
}
