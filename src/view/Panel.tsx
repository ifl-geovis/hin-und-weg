import React from "react"
import { Card } from '@blueprintjs/core'

export interface PanelProps {   
}

export interface PanelState {    
}
export default class Panel extends React.Component<PanelProps,PanelState>{
    
    constructor(props:PanelProps){
        super(props)       
    }

    public render():JSX.Element{        
       return <Card elevation={1}>{this.props.children}</Card>
    }
  }