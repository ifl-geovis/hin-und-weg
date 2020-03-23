import * as React from "react";
import {Slider} from "primereact/slider";

import * as d3 from 'd3';
import { select } from 'd3-selection';
import { Button } from "primereact/button";

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
  threshold?: number;
  hoveredBar: boolean | null;
}

export class D3Chart extends React.Component <ID3ChartProps, ID3ChartState> {
    private svgRef?: SVGElement | null;
    private chart: SVGElement | null;
    

    constructor(props: ID3ChartProps)
	{
		super(props);
    this.chart = null;
    this.state = {
      hoveredBar: null
    }
	}

    public componentDidMount() {
        this.drawBarChartH(this.props.data, this.props.theme);
       
      }
    
    public componentWillReceiveProps(nextProps: ID3ChartProps) {
        if (nextProps.data !== this.props.data || nextProps.theme !== this.props.theme) {
          this.removePreviousChart();
         this.drawBarChartH(nextProps.data, nextProps.theme)
        } 
        this.removePreviousChart();
         this.drawBarChartH(nextProps.data, nextProps.theme)
      }

    private  removePreviousChart(){
        const chart = document.getElementById('chart');
        if (chart) {
          while(chart.hasChildNodes())
          if (chart.lastChild) {
            chart.removeChild(chart.lastChild);
          }
        }
        
        }
    
    // DRAW D3 CHART

      private drawBarChartH(data: ID3ChartItem[], theme: string) {
     
        const svg = select(this.svgRef!);        

        let MARGIN = {TOP: 20, RIGHT: 10, BOTTOM: 70, LEFT: 70}
        let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
        let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;
        console.log(this.props.width);



        svg.append("svg")
          .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
          .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

        let chart = svg.append("g")
              .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

        let yLabel = svg.append("text")
          .attr("x", - HEIGHT/2)
          .attr("y", MARGIN.LEFT/5)
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)" )
          .text("Bezugsfläche")

        let xLabel = svg.append("text")
          .attr("x", WIDTH/2)
          .attr("y", HEIGHT + MARGIN.BOTTOM/1.3)
          .attr("text-anchor", "middle")
          .text("Umzuge")
          
        let xAxisGroup = chart.append("g")
          .attr("transform", `translate(0, ${HEIGHT})`)
  
        let yAxisGroup = chart.append("g")

        const max: any = d3.max(data, d => { if (d.Wert) return d.Wert})
        const min: any = d3.min(data, d => { if (d.Wert) return d.Wert})

            if (theme === "Von")
        {
          console.log("theme " + theme);

        let wrap = ( text: { each: (arg0: () => void) => void; }, width: number) => {

            text.each( function (this:string) {
              let text = d3.select(this ),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line: string[] = [],
                  lineNumber = 0,
                  lineHeight = 1.1, // ems
                  y = text.attr("y"),
                  dy = parseFloat(text.attr("dy")),
                  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
                  // console.log('text.text()', text.text());
              while (word = words.pop()) {
                line.push(word)
                tspan.text(line.join(" "))
                
                  let node:SVGTSpanElement|null = tspan.node(); 
                
                if (node){
            var hasGreaterWidth = node.getComputedTextLength() > width; 
            if (hasGreaterWidth && tspan)  {
                  line.pop()
                  tspan.text(line.join(" "))
                  line = [word]
                  tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
                }
              }}
            })
          }

          
          const x = d3.scaleLinear()
            .domain([0, max])
            .range([0, WIDTH])
          
          const y = d3.scaleBand()
            .domain(data.map(d => d["Nach"])) 
            .range([0,HEIGHT])
            .padding(0.45)

          const yAxisCall = d3.axisLeft(y)
              yAxisGroup.transition().duration(500)
                .call(yAxisCall)

          const xAxisCall = d3.axisBottom(x)
              xAxisGroup.transition().duration(500)
                .call(xAxisCall)
                .call(wrap, 15)




               
          //Data join
          const rects = chart.selectAll(".bar")
          .data(data)

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
              .attr("fill", "#d7191c")
              .attr("x", 0)
                  .transition().duration(500)
                  .attr("width", d =>  (x(d.Wert)))

           
         

          // //Exit
          rects.exit() 
            .transition().duration(500)
              .attr("width", 0)
              .attr("x", 0)
              .remove()

          //Update
          rects
          // .transition().duration(500)
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
              .attr("fill", "steelblue")
              .attr("x", 0)
                  .transition().duration(500)
                      .attr("width", d => (
                       x(d.Wert)))

            const values = chart.selectAll(".value")
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
                    .attr("text-anchor", (d) =>(x(d.Wert) - x(0)) > 20 ? "end" : "start")
                    .style("fill", (d) => (x(d.Wert) - x(0)) > 20 ? "#ffffff" : "#3a403d")
                    .text(d => { return d["Wert"]; })
                    .attr("x", 0)
                        .transition().duration(500)
                            .attr("x", (d) =>
                                ((x(d.Wert)) > 20 ? x(d.Wert) - 2 : x(d.Wert) + 1)
                              );

        }
        else if (theme === "Nach")
        {
          console.log("theme " + theme);

          let wrap = ( text: { each: (arg0: () => void) => void; }, width: number) => {

            text.each( function (this:string) {
              let text = d3.select(this ),
                  words = text.text().split(/\s+/).reverse(),
                  word,
                  line: string[] = [],
                  lineNumber = 0,
                  lineHeight = 1.1, // ems
                  y = text.attr("y"),
                  dy = parseFloat(text.attr("dy")),
                  tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
                  // console.log('text.text()', text.text());
              while (word = words.pop()) {
                line.push(word)
                tspan.text(line.join(" "))
                
                  let node:SVGTSpanElement|null = tspan.node(); 
                
                if (node){
            var hasGreaterWidth = node.getComputedTextLength() > width; 
            if (hasGreaterWidth && tspan)  {
                  line.pop()
                  tspan.text(line.join(" "))
                  line = [word]
                  tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
                }
              }}
            })
          }

          
          const x = d3.scaleLinear()
            .domain([0, max])
            .range([0, WIDTH])
          
          const y = d3.scaleBand()
            .domain(data.map(d => d["Von"])) 
            .range([0,HEIGHT])
            .padding(0.45)

          const yAxisCall = d3.axisLeft(y)
              yAxisGroup.transition().duration(500)
                .call(yAxisCall)

          const xAxisCall = d3.axisBottom(x)
              xAxisGroup.transition().duration(500)
                .call(xAxisCall)
                .call(wrap, 15)




               
          //Data join
          const rects = chart.selectAll(".bar")
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
              .attr("fill", "#d7191c")
              .attr("x", 0)
                  .transition().duration(500)
                      .attr("width", d =>  (x(d.Wert)))

           
         

          // //Exit
          rects.exit() 
            .transition().duration(500)
              .attr("width", 0)
              .attr("x", 0)
              .remove()

          //Update
          rects
          // .transition().duration(500)
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
              .attr("fill", "steelblue")
              .attr("x", 0)
                 .transition().duration(500)
                      .attr("width", d => (
                       x(d.Wert)))

            const values = chart.selectAll(".value")
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
                    .attr("text-anchor", (d) =>(x(d.Wert) - x(0)) > 20 ? "end" : "start")
                    .style("fill", (d) => (x(d.Wert) - x(0)) > 20 ? "#ffffff" : "#3a403d")
                  .text(d => { return d["Wert"]; })
                  .attr("x", 0)
                              .transition().duration(500)
                              .attr("x", (d) =>
                                ((x(d.Wert)) > 20 ? x(d.Wert) - 2 : x(d.Wert) + 1)
                              );

        } else if (theme == "Saldi") {

          console.log("theme " + theme);

          
          const x = d3.scaleLinear()
            .domain([min, max]).nice()
            .range([0, WIDTH])

            if (min > 0){
              x.domain([0,max]).nice()
            } else if (max < 0) {
              x.domain([min, 0]).nice()
            }

            console.log("xScale domain: " + x.domain);

          
          const y = d3.scaleBand()
            .domain(data.map(d => d["Von"])) 
            .rangeRound ([0, HEIGHT])
            .padding(0.45)


          const xAxisCall = d3.axisBottom(x)
              xAxisGroup.transition().duration(500)
                .call(xAxisCall)
                

          const yAxisCall = d3.axisLeft(y)
              yAxisGroup.transition().duration(500)
                .call(yAxisCall)
                .selectAll(".tick text")

          
          //Data join
          const rects = chart.selectAll("rect")
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
              .attr("fill", function(d){ return d.Wert < 0 ? "#d7191c": "#1a9641"; })

              .attr("x", WIDTH)
                      .transition().duration(500)
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
          // .transition().duration(500)
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
            .attr("fill", function(d){ return d.Wert < 0 ? "#d7191c": "#1a9641"; })
              .on('mouseover', function(d) {
                d3.select(this)
                .attr("fill", "grey")
            })
            .on('mouseout', function(d) {
              d3.select(this)
                .attr("fill", function(){ return d.Wert < 0 ? "#d7191c": "#1a9641"; })
            })
              .attr("x", WIDTH)
                    .transition().duration(500)
                    .attr("x", d => {return d.Wert < 0 ? x(d["Wert"]) : x(0) })
                    .attr("width", d => { return d.Wert < 0 ?  (x(d.Wert * -1) - x(0)) : x(d.Wert) -x(0) });
                    // .attr("fill", function(d){ return d.Wert < 0 ? "#d7191c": "#1a9641"; });
                    

              chart.append("line")
                    .attr("y1", 0 + MARGIN.TOP)
                    .attr("y2", HEIGHT - MARGIN.TOP)
                    .attr("stroke", "#3a403d")
                    .attr("stroke-width", "1px")
                    .attr("x1", WIDTH)
                    .attr("x2", WIDTH)
                    .transition().duration(500)
                      .attr("x1", x(0))
                      .attr("x2", x(0));

            const values = chart.selectAll(".value")
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
                  return (x(d.Wert * -1) - x(0)) > 20 ? "start" : "end";
                } else {
                  return (x(d.Wert) - x(0)) > 20 ? "end" : "start";
                }
              })
              .style("fill", function(d){
                if (d.Wert < 0){
                  return (x(d.Wert * -1) - x(0)) > 20 ? "#ffffff" : "#3a403d";
                } else {
                  return (x(d.Wert) - x(0)) > 20 ? "#ffffff" : "#3a403d";
                }
              })
              .text(function(d){ return d.Wert; })
              .attr("x", WIDTH)
                    .transition().duration(500)
                    .attr("x", (d) => {
                      if (d.Wert < 0){
                        return (x(d.Wert * -1) - x(0)) > 20 ? x(d.Wert) + 2 : x(d.Wert) - 1;
                      } else {
                        return (x(d.Wert) - x(0)) > 20 ? x(d.Wert) - 2 : x(d.Wert) + 1;
                      }
                    });


              // rects
              // .on("mouseover", function() {
              //   d3.select(this).data(data)
              //   .attr("fill", function(d){ return d.Wert < 0 ? "#7d0f11": "#0c5222"; });;
              // })
              // .on("mouseout", function() {
              //   d3.select(this).data(data)
              //   .attr("fill", function(d){ return d.Wert < 0 ? "#d7191c": "#1a9641"; });;
              // });

            
              d3.select("#byName").on("click",  () => {
                console.log("clicked");
                      data.sort(function(a, b) {
                        return d3.ascending(a["Von"], b["Von"])
                      })
                      y.domain(data.map(d => d["Von"])) ;
                      chart.selectAll(".bar")
                      .data(data)
                        .transition().duration(500)
                        .attr('y', d => {
                          const yCoordinate = y(d.Von)
                          if (yCoordinate) {
                              return yCoordinate
                          }
                          return null
                      })
                    });
                    

       }


      }
           
     
    
    public render() {
        const { width, height } = this.props;
    
        return (
          <div>
            
          <svg id='chart' width={width} height={height} ref={ref => (this.svgRef = ref)} />
          </div>
          
        );
      }


}

