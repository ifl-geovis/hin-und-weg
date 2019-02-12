import React from "react"

export interface MapViewProps {

}

export default class MapView extends React.Component<MapViewProps>{
    
    constructor(props:MapViewProps){
        super(props)                  
    }      
    
    public render():JSX.Element{
       return (
        <div>        
            <div>
               <p>Insert Map here.</p>
            </div>    
        </div>        
       ) 
    }
  }