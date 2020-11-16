import React from "react";
import * as d3 from 'd3';
import { select } from 'd3-selection';
import ContainerDimensions from 'react-container-dimensions';
import Classification from '../../data/Classification';
import Legend from "../elements/Legend";

export interface ITimelineD3Item
{
	Ort: string;
	Jahr: string;
	Zuzug: number;
	Wegzug: number;
	Saldo: number;
}

export interface ITimelineD3Props
{
	data: ITimelineD3Item[];
    width: number;
	height: number;
	vizID: number;
    baseViewId: number;
}

export class D3Timeline extends React.Component<ITimelineD3Props>
{
	private svgRef?: SVGElement | null;
    private svgID?: string;
	


	private timeline: any | null;

	constructor(props: ITimelineD3Props)
	{
		super(props);
		this.timeline = null;
	}

	public componentDidMount()
	{
		this.svgID = this.setSvgId(this.props.vizID, this.props.baseViewId)

		if (this.props.data){
			this.timeline = this.createTimeline(this.props.data);
		}
	}
	
	public componentDidUpdate(){
		this.removePreviousChart(this.svgID);
		this.timeline = this.createTimeline(this.props.data);
	}
		
	private setSvgId(vizId: number, BVId: number){
		let svgID = 'D3Timeline' + vizId + BVId;
		return svgID;
	  } 
  
	  private  removePreviousChart(id: string | undefined){
		if (typeof(id) === 'string') {
		  const chart = document.getElementById(id);
		  if (chart) {
			while(chart.hasChildNodes())
			if (chart.lastChild) {
			  chart.removeChild(chart.lastChild);
			}
		  }
		}       
	  }

	private createTimeline(data: ITimelineD3Item[])
	{
		const svg = select(this.svgRef!);        

		let MARGIN = {TOP: 10, RIGHT: 100, BOTTOM: 10, LEFT: 100}
		let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
		let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;

		const colorsBlue = ["#92c5de", "#4393c3", "#2166ac","#4393c3"]
		const colorsRed = ["#b2182b", "#d6604d", "#f4a582", "#d6604d"]
		const colorsBlueRed = ["#92c5de","#f4a582","#4e525c"]

		const neutralcolor = "#f7f7f7"
		const bordercolor = "#525252"

		const classification = Classification.getCurrentClassification();
		// console.log("classification: " + JSON.stringify(classification));

		
		// let colors = (data: ITimelineD3Item[]) => { 
		//   let colors = new Array(data.length);
		// 	colors.fill(neutralcolor);  
		//   for(let i=0;i<data.length;i++)
		//   { 
		// 	colors[i]=classification.getZeitreihenColor(data[i])
		//   }  return colors
		// }
		// let hexcolor:string[]  = colors(data);
		// console.log("classification colors: " + hexcolor);

		let timelinePositiveColors = classification.getZeitreihenPositiveColors();
		let timelineNegativeColors = classification.getZeitreihenNegativeColors();

		console.log("positive colors: " + timelinePositiveColors);
		console.log("negative colors: " + timelineNegativeColors);

		// let hexcolorAdd: string[] =  classColors(data);
		//   hexcolorAdd.push("#f7f7f7");

		svg.append("svg")
		.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
		.attr("height", HEIGHT)

		const max: any = d3.max(data, d => { if (d.Zuzug) return d.Zuzug})
		const min: any = d3.min(data, d => { if (d.Wegzug) return d.Wegzug})

		svg.append("svg")
		.attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
		.attr("height", "auto")
		
		let wegzug = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
			.attr("id", "chart")
		let zuzug = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
			.attr("id", "chart")
		let chart = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
			.attr("id", "chart")
		let graph = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
			.attr("id", "chart")
		let circlesArea = svg.append("g")
			.attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
			.attr("id", "chart")
	
		data.forEach(function(d) {
			d.Saldo = +d.Saldo;
			d.Zuzug = +d.Zuzug;
			d.Wegzug = +d.Wegzug;
		});
		  
		const y = d3.scaleLinear()
				.domain([(min - (max - min)/9), (max + (max - min)/9)])
				.range([HEIGHT, 0])

		const domain = data.map(d => d.Jahr);

		const x = d3.scaleBand()
			.domain(domain)
			.range([0, WIDTH])
			.padding(0.25);

		const xAxisGroup = chart.append('g')
			.attr('class', 'x-axis')
			.attr("transform", `translate(0, ${HEIGHT})`)
		const yAxisGroup = chart.append('g')
			.attr('class', 'y-axis')


		const rectsZuzug = zuzug.selectAll("rect")
			.data(data)
			.enter()
			.append("rect")
			.attr("width", WIDTH/x.domain.length)
			.style("fill-opacity",1e-6)
			.attr("stroke", function(d) { let col:any = d3.rgb(timelinePositiveColors[0]); return col.darker(); })
			.attr("stroke-width", 1);

		rectsZuzug
			.attr('x', d => {
				const xCoordinate = x(d.Jahr)
				if (xCoordinate) {
					return xCoordinate
				}
				return null
			})
			.attr("y", d => y(d.Zuzug))
			.attr("height", d => (y(0) - y(d.Zuzug)))
			.attr("width", x.bandwidth())
			.attr('fill', timelinePositiveColors[0])
			// .attr('fill', colorsBlueRed[1])
			.style("fill-opacity",1)
			.attr("stroke", function(d) { let col:any = d3.rgb(timelinePositiveColors[0]); return col.darker(); })
			// .attr("stroke", function(d) { let col:any = d3.rgb(colorsBlueRed[1]); return col.darker(); })
			.attr("stroke-width", 1)
			.on("mouseover",  function(d, i) {
				rectsZuzug
				.filter( (d, j) => {
					return j != i;
					})
					.transition()
					.style("opacity", 0.1)
				rectsWegzug
					.filter( (d, j) => {
						return j != i;
					})
					.transition()
					.style("opacity", 0.1)
			})
			.on("mouseout", function(d, i) {
				rectsZuzug
				.filter( (d, j) => {
					return j != i;
					})
					.transition()
					.style("opacity", 1)
				rectsWegzug
					.filter( (d, j) => {
						return j != i;
					})
					.transition()
					.style("opacity", 1)
			});


			const rectsWegzug = wegzug.selectAll("rect")
				.data(data)
				.enter()
				.append("rect")
				.attr("width", WIDTH/x.domain.length)
				.style("fill-opacity",1e-6)
				.attr("stroke", function(d) { let col:any = d3.rgb(timelineNegativeColors[0]); return col.darker(); })
				.attr("stroke-width", 1.5);

			rectsWegzug
				.attr('x', d => {
					const xCoordinate = x(d.Jahr)
					if (xCoordinate) {
						return xCoordinate
					}
					return null
				})
				.attr("y", y(0))
				.attr("height", d => (y(0) - y(-d.Wegzug)))
				.attr("width", x.bandwidth())
				.attr('fill', timelineNegativeColors[0])
				.style("fill-opacity",1)
				.attr("stroke", function(d) { let col:any = d3.rgb(timelineNegativeColors[0]); return col.darker(); })
				.attr("stroke-width", 1)
				.on("mouseover",  function(d, i) {
					rectsZuzug
					.filter( (d, j) => {
						return j != i;
						})
						.transition()
						.style("opacity", 0.1)
					rectsWegzug
						.filter( (d, j) => {
							return j != i;
						})
						.transition()
						.style("opacity", 0.1)
				})
				.on("mouseout", function(d, i) {
					rectsZuzug
					.filter( (d, j) => {
						return j != i;
						})
						.transition()
						.style("opacity", 1)
					rectsWegzug
						.filter( (d, j) => {
							return j != i;
						})
						.transition()
						.style("opacity", 1)
				});

			const xAxis = d3.axisBottom(x)
			const yAxis = d3.axisLeft(y)
				.ticks(9)
			xAxisGroup.call(xAxis);
			yAxisGroup.call(yAxis);


			chart.append("line")
				.attr("x1", 0)
				.attr("x2", WIDTH )
				.attr("stroke", "#3a403d")
				.attr("stroke-width", "1px")
				.attr("y1", y(0))
				.attr("y2", y(0));

			chart.append("line")
				.attr("x1", 0)
				.attr("x2", WIDTH )
				.attr("stroke", "#3a403d")
				.attr("stroke-width", "1px")
				.attr("y1", HEIGHT)
				.attr("y2", HEIGHT);

			// Add the valueline path.
			let lineGenerator = d3.line<ITimelineD3Item>()
				.x(function(d) {
					const xCoordinate = x(d.Jahr)
					if (xCoordinate) {
						return xCoordinate + x.bandwidth()/2
					}
					return 0
					})
				.y(function(d) { return y(d.Saldo); });

			const linegraph = graph.append("path")
				.datum(data)
				.attr("d", lineGenerator)
				.attr("stroke", "black")
				.attr("stroke-width", 2.5)
				.attr("fill", "none");
		
	  		rectsZuzug.append("title")
			rectsZuzug.select("title")
			  .text(function(d, i) {
				let t:string
				t = "Jahr: " + d.Jahr
				+ "\n" +"Zuzug: "  + d.Zuzug
				+ "\n" + "Wegzug: "  + d.Wegzug
				+ "\n" + "Saldo: "  + d.Saldo
				return t
			  }) 
			rectsWegzug.append("title")
			rectsWegzug.select("title")
				.text(function(d, i) {
					let t:string
					  t = "Jahr: " + d.Jahr
					  + "\n" +"Zuzug: "  + d.Zuzug
					  + "\n" + "Wegzug: "  + d.Wegzug
					  + "\n" + "Saldo: "  + d.Saldo
					  return t
					}) 

			const circlesGraph = circlesArea.selectAll('circle')
				.data(data)
				.enter()
				.append('circle');

			circlesGraph
				.attr('r', (WIDTH/data.length)/8)
				.attr('cx', d => {
					const xCoordinate = x(d.Jahr)
					if (xCoordinate) {
						return xCoordinate + x.bandwidth()/2
					}
					return null
				})
				.attr('cy', d => y(d.Saldo))
				.attr('fill', d => { return d.Saldo < 0 ? timelineNegativeColors[1] : timelinePositiveColors[1]})
				.attr('stroke', 'black')
				.on("mouseover",  function(d, i) {
					rectsZuzug
					.filter( (d, j) => {
						return j != i;
						})
						.transition()
						.style("opacity", 0.1)
					rectsWegzug
						.filter( (d, j) => {
							return j != i;
						})
						.transition()
						.style("opacity", 0.1)
				})
				.on("mouseout", function(d, i) {
					rectsZuzug
					.filter( (d, j) => {
						return j != i;
						})
						.transition()
						.style("opacity", 1)
					rectsWegzug
						.filter( (d, j) => {
							return j != i;
						})
						.transition()
						.style("opacity", 1)
				});

			circlesGraph.append("title")
			circlesGraph.select("title")
					.text(function(d, i) {
					let t:string
					t = "Jahr: " + d.Jahr
					+ "\n" +"Zuzug: "  + d.Zuzug
					+ "\n" + "Wegzug: "  + d.Wegzug
					+ "\n" + "Saldo: "  + d.Saldo
					return t
				}) 

	}

	public render(): JSX.Element
	{
		return (
			<div className="p-grid">
				<ContainerDimensions>
                        { ({ width, height }) => 
                            <svg id={this.svgID} width={width} height={width} ref={ref => (this.svgRef = ref)} />
                        }
                    </ContainerDimensions>
			</div>
		);
	}

}
