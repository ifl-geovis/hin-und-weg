import React from "react"
import R from 'ramda'
import ChartChooserView from "./ChartChooserView"
import LegendView from "./LegendView"
import ChartView from "./ChartView"
import Tabledata from '../../model/Tabledata'

export interface ChartsViewProps {
    tabledatas: {[name:string]: Tabledata}
}

interface ChartsViewState {
    chartType: string 
}

export default class ChartsView extends React.Component<ChartsViewProps,ChartsViewState>{
    
    constructor(props:ChartsViewProps){
        super(props)         
        this.onChartTypeSelect = this.onChartTypeSelect.bind(this)
        this.onRangeSelect = this.onRangeSelect.bind(this)
        this.state = {
            chartType: 'Liniendiagramm'
        }       
    }    

    private onChartTypeSelect(selected: string){        
        this.setState({chartType:selected})
    }
   
    private onRangeSelect(range: string){
       console.log("Selected range "+range)
    }

    public render():JSX.Element{
        let ranges = R.keys(this.props.tabledatas) as string[]
        return <div>                
                <ChartChooserView 
                    onSelectRange={this.onRangeSelect}
                    onSelectChartType={this.onChartTypeSelect}
                    diagramTypes={['Liniendiagramm','Balkendiagramm','Sankey']}
                    rangeTypes={ranges}
                />
                <ChartView tabledatas={this.props.tabledatas} type={this.state.chartType}/>
                <LegendView tabledatas={this.props.tabledatas}/>
            </div>       
    }
  }