import React from "react"
import { HTMLSelect } from '@blueprintjs/core'

export interface ChartChooserProps {
    diagramTypes: string[]
    yearTypes: string[]
    onSelectChartType: (name:string) => void
    onSelectYearsType: (name:string) => void 
}

export default class ChartChooserView extends React.Component<ChartChooserProps>{
    
    constructor(props:ChartChooserProps){
        super(props)                
        this.onChartTypeSelect = this.onChartTypeSelect.bind(this)
        this.onYearSelect = this.onYearSelect.bind(this)
    }    

    private onChartTypeSelect(event: React.ChangeEvent<HTMLSelectElement>){
        this.props.onSelectChartType(event.target.options[event.target.selectedIndex].value)
    }
   
    private onYearSelect(event: React.ChangeEvent<HTMLSelectElement>){
        this.props.onSelectYearsType(event.target.options[event.target.selectedIndex].value)
    }

    public render():JSX.Element{
       return (
        <div>
            <HTMLSelect options={this.props.diagramTypes} onChange={this.onChartTypeSelect}/>
            <HTMLSelect options={this.props.yearTypes} onChange={this.onYearSelect}/>
        </div>   
       ) 
    }
  }
