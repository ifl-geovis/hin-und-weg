import * as React from "react";
import {Slider} from "primereact/slider";
import { Checkbox } from 'primereact/checkbox';

import * as d3 from 'd3';
import { select } from 'd3-selection';
import R from "ramda";


export interface ID3ChartItem
{
	Von: string;
	Nach: string;
	Wert: number;
  Absolutwert: number;
}

export interface ID3ChartProps {
	data: ID3ChartItem[];
    theme: string;
    width: number;
    height: number;
}
interface ID3ChartState
{
  threshold: number;
  rangeValues: [number, number],
  selectedRadio: string,
  checked: boolean 
}

export class D3Chart extends React.Component <ID3ChartProps, ID3ChartState> {
    private svgRef?: SVGElement | null;    

    constructor(props: ID3ChartProps)
	{
		super(props);
    this.state = {
      threshold: 0,
      rangeValues: [0, 0],
      selectedRadio: 'kleineWerte',
      checked: false
    }
	}

    public componentDidMount() {
      const [min, max] = this.getMinMax2();
      let data1 :ID3ChartItem[] = R.filter((item) => item.Wert <= this.state.rangeValues[0] &&item.Wert >= min, this.props.data);
      let data2 :ID3ChartItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[1] &&item.Wert <= max, this.props.data);
      let dataFilterSmall: ID3ChartItem[] = R.concat(data1, data2);
      let dataFilterLarge :ID3ChartItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[0] && item.Wert <= this.state.rangeValues[1], this.props.data);
      let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;
      let normalizedData:ID3ChartItem[] = R.filter((item) => item.Wert >= this.state.threshold, this.props.data);
      let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData
      if (data)  {this.drawBarChartH(data, this.props.theme)}
       
      }
    public shouldComponentUpdate (nextProps: ID3ChartProps, nextState: ID3ChartState) {
      return nextProps.data !== this.props.data || nextProps.theme !== this.props.theme || nextState.checked !== this.state.checked || nextProps.width !== this.props.width || nextProps.height !== this.props.height || nextState.threshold !==this.state.threshold || nextState.rangeValues !== this.state.rangeValues || nextState.selectedRadio !== this.state.selectedRadio
    }

    public componentDidUpdate(){
        const [min, max] = this.getMinMax2();
        let threshold: number = this.calculateCurrentThreshold();

        let data1 :ID3ChartItem[] = R.filter((item) => item.Wert <= this.state.rangeValues[0] &&item.Wert >= min, this.props.data);
        let data2 :ID3ChartItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[1] &&item.Wert <= max, this.props.data);
        let dataFilterSmall: ID3ChartItem[] = R.concat(data1, data2);
        let dataFilterLarge :ID3ChartItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[0] && item.Wert <= this.state.rangeValues[1], this.props.data);
        let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;
        let normalizedData:ID3ChartItem[] = R.filter((item) => item.Wert >= threshold, this.props.data);
        let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData

        this.removePreviousChart();
        this.drawBarChartH(data, this.props.theme);
    }
    
    

    private  removePreviousChart(){
        const chart = document.getElementById('BarChart');
        if (chart) {
          while(chart.hasChildNodes())
          if (chart.lastChild) {
            chart.removeChild(chart.lastChild);
          }
        }
    }
    
    // DRAW D3 CHART
    private drawBarChartH(data: ID3ChartItem[], theme: string) {
     
      const svgBarChart = select(this.svgRef!);        

      let MARGIN = {TOP: 20, RIGHT: 15, BOTTOM: 30, LEFT: 150}
      let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
      let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;

      const colorsBlue = ["#92c5de", "#2166ac"]
      const colorsRed = ["#b2182b", "#f4a582"]

      svgBarChart.append("svg")
          .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
          .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

      let barChart = svgBarChart.append("g")
          .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
          
      let xAxisGroup = barChart.append("g")
          .attr("transform", `translate(0, ${HEIGHT})`)
  
      let yAxisGroup = barChart.append("g")

      const max: any = d3.max(data, d => { if (d.Wert) return d.Wert})
      const min: any = d3.min(data, d => { if (d.Wert) return d.Wert})
      
      if (theme === "Von")
      {
        const x = d3.scaleLinear()
            .domain([0, max])
            .range([0, WIDTH])
          
        const y = d3.scaleBand()
            .domain(data.map(d => d.Nach)) 
            .range([0,HEIGHT])
            .padding(0.1)

        const yAxisCall = d3.axisLeft(y)
              yAxisGroup
                .call(yAxisCall)
                .attr("class", "axis axis--y")
                .style("font-size", "12px")


        const xAxisCall = d3.axisBottom(x)
              xAxisGroup
                .call(xAxisCall)
                .attr("class", "axis axis--x")

        let rects = barChart.append("g")  
          .attr("class", "rects")
          .selectAll(".bar")
          .data(data)

        function select_axis_label(datum: ID3ChartItem) {
            return d3.select('.axis--y')
              .selectAll('text')
              .filter(function(x) { return x === datum.Nach; });
          }

        rects
          .enter()
              .append("rect")
              .attr("class", "bar")
              .attr("height", y.bandwidth())
              .attr('y', d => {
                const yCoordinate = y(d.Nach)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
              })
              .attr("fill", colorsBlue[1])
              .attr("x", 0)
                .attr("width", d =>  (x(d.Wert)));

        rects.exit() 
            .transition().duration(500)
              .attr("width", 0)
              .attr("x", 0)
              .remove()

          //Update
        rects
          .attr('y', d => {
            const yCoordinate = y(d.Nach)
            if (yCoordinate) {
                return yCoordinate
            }
            return null
          })
          .attr("height", y.bandwidth())
          .attr("width", d => ( x(d.Wert)))

          //Enter
        rects.enter()
            .append("rect")
              .attr("height", y.bandwidth())
              .attr('y', d => {
                const yCoordinate = y(d.Nach)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
              })
              .attr("fill", colorsBlue[1])
              .on('mouseover', function(d) {
                d3.select(this)
                .attr("fill", colorsBlue[0]);
                values
                .filter(dd => dd === d)
                .attr( "font-weight", "bold")
                .style("fill", "black");
                select_axis_label(d).attr('style', "font-weight: bold;").style("font-size", "13px");
              })
              .on('mouseout', function(d) {
                d3.select(this)
                .attr("fill", colorsBlue[1]);
                values
                .attr( "font-weight", "regular")
                .style("fill", (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d");
                  select_axis_label(d).attr('style', "font-weight: regular;").style("font-size", "12px");
              })
              .attr("x", 0)
                      .attr("width", d => ( x(d.Wert)));

          const values = barChart.selectAll(".value")
                    .data(data)
                    .enter().append("text")
                    .attr("class","value")
                    .attr('y', d => {
                      const yCoordinate = y(d.Nach)
                      if (yCoordinate) {
                          return yCoordinate
                      }
                      return null
                    })
                    .attr("dy", y.bandwidth() - 2.55)
                    .attr("text-anchor", (d) =>(x(d.Wert) - x(0)) > 30 ? "end" : "start")
                    .style("fill", (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d")
                    .text(d => { return d["Wert"]; })
                    .style("font-size", "15px" )
                            .attr("x", (d) =>
                                ((x(d.Wert)) > 30 ? x(d.Wert) - 2 : x(d.Wert) + 1)
                              );

        }
        else if (theme === "Nach")
        {
          const x = d3.scaleLinear()
            .domain([0, max])
            .range([0, WIDTH])
          
          const y = d3.scaleBand()
            .domain(data.map(d => d.Von)) 
            .range([0,HEIGHT])
            .padding(0.1)

            const yAxisCall = d3.axisLeft(y)
            yAxisGroup
              .call(yAxisCall)
              .attr("class", "axis axis--y")
              .style("font-size", "12px")

      const xAxisCall = d3.axisBottom(x)
            xAxisGroup
              .call(xAxisCall)
              .attr("class", "axis axis--x")

      function select_axis_label(datum: ID3ChartItem) {
          return d3.select('.axis--y')
            .selectAll('text')
            .filter(function(x) { return x === datum.Von; });
      }

          const rects = barChart.selectAll(".bar")
            .data(data)

          rects
            .enter()
              .append("rect")
              .attr("class", "bar")
              .attr("height", y.bandwidth())
              .attr('y', d => {
                const yCoordinate = y(d.Von)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
             })
              .attr("fill", colorsRed[0])
              .attr("x", 0)
              .attr("width", d =>  (x(d.Wert)))
                      
          rects.exit() 
            .transition().duration(500)
              .attr("width", 0)
              .attr("x", 0)
              .remove()

          //Update
          rects
          .attr('y', d => {
            const yCoordinate = y(d.Von)
            if (yCoordinate) {
                return yCoordinate
            }
            return null
          })
          .attr("height", y.bandwidth())
          .attr("width", d => ( x(d.Wert)))

          //Enter
          rects.enter()
              .append("rect")
              .attr("height", y.bandwidth())
              .attr('y', d => {
                const yCoordinate = y(d.Von)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
              })
              .attr("fill", colorsRed[0])
              .on('mouseover', function(d) {
                d3.select(this)
                .attr("fill", colorsRed[1]);
                values
                  .filter(dd => dd === d)
                  .attr( "font-weight", "bold")
                  .style("fill", "black")
                select_axis_label(d).attr('style', "font-weight: bold;").style("font-size", "13px");
              })
              .on('mouseout', function(d) {
                d3.select(this)
                .attr("fill", colorsRed[0]);
                values
                  .attr( "font-weight", "regular")
                  .style("fill", (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d")
                  select_axis_label(d).attr('style', "font-weight: regular;").style("font-size", "12px");
              })
              .attr("width", d => (x(d.Wert)));

            const values = barChart.selectAll(".value")
                    .data(data)
                    .enter().append("text")
                    .attr("class","value")
                    .attr('y', d => {
                      const yCoordinate = y(d.Von)
                      if (yCoordinate) {
                          return yCoordinate
                      }
                      return null
                    })
                    .attr("dy", y.bandwidth() - 2.55)
                    .attr("text-anchor", (d) =>(x(d.Wert) - x(0)) > 30 ? "end" : "start")
                    .style("fill", (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d")
                    .text(d => { return d["Wert"]; })
                    .style("font-size", "15px")
                        .attr("x", (d) => ((x(d.Wert)) > 30 ? x(d.Wert) - 2 : x(d.Wert) + 1));

        } 
        else if (theme == "Saldi") 
        {

          const x = d3.scaleLinear()
            .domain([min, max]).nice()
            .range([0, WIDTH])

            if (min > 0){
              x.domain([0,max]).nice()
            } else if (max < 0) {
              x.domain([min, 0]).nice()
            }
          
          const y = d3.scaleBand()
            .domain(data.map(d => d["Von"])) 
            .rangeRound ([0, HEIGHT])
            .padding(0.1)

          const xAxisCall = d3.axisBottom(x)
              xAxisGroup.transition().duration(500)
                .call(xAxisCall)
                .attr("class", "axis axis--x")
                
          const yAxisCall = d3.axisLeft(y)
              yAxisGroup
                .call(yAxisCall)
                .attr("class", "axis axis--y")
                .selectAll(".tick text")
                .style("font-size", "12px")


          function select_axis_label(datum: ID3ChartItem) {
            return d3.select('.axis--y')
              .selectAll('text')
              .filter(function(x) { return x === datum.Von; });
          }      

          //Data join
          const rects = barChart.selectAll("rect")
           .data(data)
          rects
            .enter()
              .append("rect")
              .attr("class", "bar")
              .attr("height", y.bandwidth())
              .attr('y', d => {
                const yCoordinate = y(d.Von)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
            })
              .attr("fill", function(d){ return d.Wert < 0 ? colorsBlue[1]: colorsRed[0]; })
                      .attr("x", d => {return d.Wert < 0 ? x(d["Wert"]) : x(0) })
                      .attr("width", d => { return d.Wert < 0 ?  (x(d.Wert * -1) - x(0)) : x(d.Wert) -x(0) });
                        
              
            // //Exit
          rects.exit() 
              .transition().duration(500)
                .attr("width", 0)
                .attr("x", WIDTH)
                .remove()

          //Update
          rects
            .attr('y', d => {
              const yCoordinate = y(d.Von)
              if (yCoordinate) {
                  return yCoordinate
              }
              return null
              })
            .attr("height", y.bandwidth())
            .attr("x", d => {return d.Wert < 0 ? x(d["Wert"]) : x(0) })         
            .attr("width", d => { return d.Wert < 0 ?  (x(d.Wert * -1) - x(0)) : x(d.Wert) -x(0) })

          
          //Enter
          rects.enter()
              .append("rect")
              .attr("height", y.bandwidth())
              .attr('y', d => {
                const yCoordinate = y(d.Von)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
              })
            .attr("fill", function(d){ return d.Wert < 0 ? colorsBlue[1]: colorsRed[0]; })
            .on('mouseover', function(d) {
                d3.select(this)
                  .attr("fill", function(dd){ return d.Wert < 0 ? colorsBlue[0]: colorsRed[1]; });
                values
                  .filter(dd => dd === d)
                  .attr( "font-weight", "bold")
                  .style("fill", "black")
                select_axis_label(d).attr('style', "font-weight: bold; ").style("font-size", "13px");            
              })
            .on('mouseout', function(d) {
              d3.select(this)
                  .attr("fill", function(){ return d.Wert < 0 ? colorsBlue[1]: colorsRed[0]; });
                values
                .attr( "font-weight", "regular")
                .style("fill", function(d){
                  if (d.Wert < 0){
                    return (x(d.Wert * -1) - x(0)) > 30 ? "#ffffff" : "#3a403d";
                  } else {
                    return (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d";
                  }
                  })
                select_axis_label(d).attr('style', "font-weight: regular;").style("font-size", "12px");

            })
                .attr("x", d => {return d.Wert < 0 ? x(d["Wert"]) : x(0) })
                .attr("width", d => { return d.Wert < 0 ?  (x(d.Wert * -1) - x(0)) : x(d.Wert) -x(0) });

          barChart.append("line")
                    .attr("y1", 0 + MARGIN.TOP)
                    .attr("y2", HEIGHT - MARGIN.TOP)
                    .attr("stroke", "#3a403d")
                    .attr("stroke-width", "1px")
                      .attr("x1", x(0))
                      .attr("x2", x(0));

            const values = barChart.selectAll(".value")
              .data(data)
              .enter().append("text")
              .attr("class", "value")
              .attr("y", d => {
                const yCoordinate = y(d.Von)
                if (yCoordinate) {
                    return yCoordinate
                }
                return null
               })
              .attr("dy", y.bandwidth() - 2.55)
              .attr("text-anchor", function(d){
                if (d.Wert < 0){
                  return (x(d.Wert * -1) - x(0)) > 30 ? "start" : "end";
                } else {
                  return (x(d.Wert) - x(0)) > 30 ? "end" : "start";
                }
                })
              .style("fill", function(d){
                if (d.Wert < 0){
                  return (x(d.Wert * -1) - x(0)) > 30 ? "#ffffff" : "#3a403d";
                } else {
                  return (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d";
                }
                })
              .style("font-size", "15px")
              .text(function(d){ return d.Wert; })
                    .attr("x", (d) => {
                      if (d.Wert < 0){
                        return (x(d.Wert * -1) - x(0)) > 30 ? x(d.Wert) + 2 : x(d.Wert) - 1;
                      } else {
                        return (x(d.Wert) - x(0)) > 30 ? x(d.Wert) - 2 : x(d.Wert) + 1;
                      }
                    });

       }


      }
           
      private getMinMax2(): [number, number]
	{
		let max = Number.MIN_VALUE;
		let second_max = Number.MIN_VALUE;
		let min = Number.MAX_VALUE;
		if (this.props.data)
		{
			for (let item of this.props.data)
			{
				if (item["Wert"] < min)
				{
					min = item["Wert"];
				}
				if (item["Wert"] > max)
				{
					if (max > second_max)
					{
						second_max = max;
					}
					max = item["Wert"];
				}
				else if (item["Wert"] > second_max)
				{
					second_max = item["Wert"];
				}
			}
		}
		return [min, max + 1];
  }

  private calculateCurrentThreshold(): number
  {
    const [min, max] = this.getMinMax2();
    let threshold: number = this.state.threshold;
    if (this.state.threshold == 0) threshold = min;
    if (this.state.threshold < min) threshold = min;
    if (this.state.threshold > max) threshold = max;
    return threshold;
  }
  private getInitialValuesSliderSaldi(): [number, number]
  {
    let [min, max] = this.getMinMax2();
    let rangeValues: [number, number] = this.state.rangeValues;
    let value1: number = min + (Math.abs(min) + Math.abs(max))/4;
    let value2: number = max - (Math.abs(min) + Math.abs(max))/4;
    if (this.state.rangeValues[0] == 0) rangeValues[0] = value1;
    if (this.state.rangeValues[1] == 0) rangeValues[1] = value2;
    if (this.state.rangeValues[0] < min) rangeValues[0] = value1;
    if (this.state.rangeValues[0] > max) rangeValues[0] = value1;
    if (this.state.rangeValues[1] < min) rangeValues[1] = value2;
    if (this.state.rangeValues[1] > max) rangeValues[1] = value2;
    return rangeValues;
  }
    
    public render() {
      const { width, height } = this.props;
      const [min, max] = this.getMinMax2();
      let threshold: number = this.calculateCurrentThreshold();
      let rangeValues: [number, number] = this.getInitialValuesSliderSaldi();
      let saldiText: string = (this.state.checked === true)? ('ab ' + min + ' bis: ' + rangeValues[0] + '       und          ab: ' + rangeValues[1] + ' bis: ' + max) : ('ab ' + rangeValues[0] + ' bis: ' + rangeValues[1]);
    
        return (
          <div className="p-grid">
             <div className="p-col-12">
              <Checkbox
                onChange={(e: { value: any, checked: boolean }) => this.setState({checked: e.checked})}
                checked={this.state.checked}
                disabled= {(this.props.theme === 'Saldi') ? false : true}
              />
              <label className="p-checkbox-label">Umgekehrt filtern</label>
             </div>
             <div className="p-col-1">{min}</div>
			  	<div className="p-col-10">
                {
                    this.props.theme == "Saldi" ? 
                    <Slider min={min} max={max} value={this.state.rangeValues} onChange={(e) => this.setState({rangeValues: e.value as [number, number]})} range={true} style={this.state.checked === true? {background: '#1f7ed0', color: '#80CBC4'}:{}} />
                    :
                    <Slider min={min} max={max} value={threshold} orientation="horizontal" onChange={(e) => this.setState({ threshold: e.value as number})}/>
                }				
          </div>
			  	<div className="p-col-1">{max}</div>
			    	<div className="p-col-12 p-justify-center">{this.props.theme == "Saldi" ? 'Anzeige Werte in Bereich: ' + saldiText : 'Anzeige ab Wert: ' + threshold  }</div>
			    	<div className="p-col-12" >
               <svg id='BarChart' width={width} height={height} ref={ref => (this.svgRef = ref)} />
            </div>
          </div>
        );
      }


}

