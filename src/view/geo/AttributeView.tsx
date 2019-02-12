import React from "react"

export interface AttributeViewProps {

}

export default class AttributeView extends React.Component<AttributeViewProps>{
    
    constructor(props:AttributeViewProps){
        super(props)                  
    }      
    public render():JSX.Element{
       return (
        <div>        
            <div>
               <p>Insert Attributes here.</p>
            </div>    
        </div>        
       ) 
    }
  }