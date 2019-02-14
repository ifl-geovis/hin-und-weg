import React from "react"
import { HTMLSelect } from '@blueprintjs/core'

export interface ChartChooserProps {
    diagramTypes: string[]
    rangeTypes: string[]
    onSelectChartType: (name:string) => void
    onSelectRange: (name:string) => void 
}

export default class ChartChooserView extends React.Component<ChartChooserProps>{
    
    constructor(props:ChartChooserProps){
        super(props)                
        this.onChartTypeSelect = this.onChartTypeSelect.bind(this)
        this.onSelectRange = this.onSelectRange.bind(this)
    }    

    private onChartTypeSelect(event: React.ChangeEvent<HTMLSelectElement>){
        this.props.onSelectChartType(event.target.options[event.target.selectedIndex].value)
    }
   
    private onSelectRange(event: React.ChangeEvent<HTMLSelectElement>){
        this.props.onSelectRange(event.target.options[event.target.selectedIndex].value)
    }

    public render():JSX.Element{
       return (
        <div>
            <HTMLSelect options={this.props.diagramTypes} onChange={this.onChartTypeSelect}/>
            <HTMLSelect options={this.props.rangeTypes} onChange={this.onSelectRange}/>
        </div>   
       ) 
    }
  }
