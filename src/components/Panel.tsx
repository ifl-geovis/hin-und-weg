import React from "react"
import { Rnd, } from "react-rnd"

export interface PanelProps {

}

export interface PanelState {
    width: number,
    height: number,
    x: number,
    y: number
}
export default class Panel extends React.Component<PanelProps,PanelState>{

    constructor(props:PanelProps){
        super(props)
        this.state = {
            width: 320,
            height: 200,
            x: 10,
            y: 10
        }
    }

    public render():JSX.Element{
        return <Rnd className="bp3-card bp3-elevation-2"                    
                    size={{ width: this.state.width, height: this.state.height }}            
                    position={{ x: this.state.x, y: this.state.y }}
                    onDragStop={(e, d) => {
                        this.setState({ x: d.x, y: d.y });
                      }}
                      onResize={(e, direction, ref, delta, position) => {   
                        let newWidth =  parseInt(ref.style.width!)      
                        let newHeight = parseInt(ref.style.height!)               
                        this.setState({   
                          width: newWidth,
                          height: newHeight,                      
                          ...position
                        });
                      }} 
        >
        {this.props.children}
        </Rnd>
    }
  }