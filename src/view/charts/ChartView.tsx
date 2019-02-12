import React from 'react'
import { scaleLinear,max,select } from 'd3'

export interface ChartViewProps {

}

export default class ChartView extends React.Component<ChartViewProps>{

    svgNode: SVGSVGElement | null

    constructor(props:ChartViewProps){
        super(props)
        this.createBarChart = this.createBarChart.bind(this)
        this.svgNode = null
    }    

    componentDidMount() {
        this.createBarChart()
    }

    componentWillUnmount() {
        this.svgNode = null
    }
    
    createBarChart() {
      let data = [5,Math.random()*10,1,3]
      let size = [500,500]

      const node = this.svgNode
      const dataMax = max(data)!
      const yScale = scaleLinear().domain([0, dataMax]).range([0, size[1]])

      select(node)
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
   
      select(node)
        .selectAll('rect')
        .data(data)
        .exit()
        .remove()
          
      select(node)
        .selectAll('rect')
        .data(data)
        .style('fill', '#fe9922')
        .attr('x', (d,i) => i * 25)
       // .attr('y', d => size[1] — yScale(d))
        .attr('height', d => yScale(d))
        .attr('width', 25)
   }

    render():JSX.Element {
        return <svg ref={node => this.svgNode = node} width={500} height={500}></svg>
     }      
}
