import React from "react"
import ChartChooserView from "./ChartChooserView"
import LegendView from "./LegendView"
import ChartView from "./ChartView"
import Panel from "../Panel"


export interface ChartsViewProps {

}

export default class ChartsView extends React.Component<ChartsViewProps>{
    
    constructor(props:ChartsViewProps){
        super(props)                
    }    

    private onChartTypeSelect(event: React.ChangeEvent<HTMLSelectElement>){
        console.log(`onChartTypeSelect:${event.target.options[event.target.selectedIndex].value}`)
    }
   
    private onYearSelect(event: React.ChangeEvent<HTMLSelectElement>){
        console.log(`onYearSelect: ${event.target.options[event.target.selectedIndex].value}`)
    }

    public render():JSX.Element{
       return (
           <Panel>
                <ChartChooserView 
                    onSelectYearsType={console.log}
                    onSelectChartType={console.log}
                    diagramTypes={['Diagrammtyp auswählen','Liniendiagramm','Balkendiagramm','Sankey']}
                    yearTypes={['Jahr(e) auswählen','Alle Jahre','2001','2002','2003']}
                />
                <ChartView/>
                <LegendView/>
            </Panel>
       ) 
    }
  }