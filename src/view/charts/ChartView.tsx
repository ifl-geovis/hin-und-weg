import React from 'react'
import R from 'ramda'
import Tabledata from '../../model/Tabledata'
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts'

export interface ChartViewProps {
  tabledatas: { [name: string] : Tabledata} 
  type: string | null
  range: string | null
}

export default class ChartView extends React.Component<ChartViewProps>{    

    constructor(props:ChartViewProps){
        super(props)                
    }    

    render():JSX.Element {
        if(this.props.tabledatas && this.props.range){          
          let selectedTabledata = this.props.tabledatas[this.props.range]
          if(selectedTabledata){
            let toNum = (val: string) => {
              try{
                return parseFloat(val)
              }catch(e){
                return 0
              }
            }
            selectedTabledata = selectedTabledata.getTabledataBy([1,selectedTabledata.getRowCount()],[1,selectedTabledata.getColumnCount()])         
            let sumOfDestinationMoves = R.map((rowNum) => {              
              let sumValue = R.reduce((sum,val) => R.add(sum,toNum(val)),0,selectedTabledata.getRowAt(rowNum))
              return { rowNum: rowNum, sum: sumValue}
            },R.range(0,selectedTabledata.getRowCount()))                            
            return(
              <BarChart
              width={500}
              height={300}
              data={sumOfDestinationMoves}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3YAxis 3" />
              <XAxis dataKey="sum" />
              <YAxis/>
              <Tooltip />
              <Legend />
              <Bar dataKey="sum" fill="#8884d8" />              
            </BarChart>
            )
          }       
      }      
      return (<svg width="500" height="500"><text transform="translate(250,250)">{this.props.type==null?'Kein':this.props.type}</text></svg>)
     }      
}
