import * as React from "react";
import {Slider as Slider} from "primereact/slider";
import { Checkbox } from 'primereact/checkbox';

import * as d3 from 'd3';
import * as d3Sankey from 'd3-sankey';
import { select } from 'd3-selection';
import R from "ramda";

export interface ID3SankeyItem
{
	Von: string;
	Nach: string;
	Wert: number;
  Absolutwert: number;
}

export interface ID3SankeyProps {
	data: ID3SankeyItem[];
    theme: string;
    jahr?: string;
    width: number;
    height: number;
}
interface ID3SankeyState
{
  threshold: number;
  rangeValues: [number, number],
  checked: boolean
}

interface SNodeExtra {
    nodeId: number;
    name: string;
    negative: number;
}

interface SLinkExtra {
    source: number;
    target: number;
    value: number;
    negative: number |undefined;
}
type SNode = d3Sankey.SankeyNode<SNodeExtra, SLinkExtra>;
type SLink = d3Sankey.SankeyLink<SNodeExtra, SLinkExtra>;

interface DAG {
    nodes: SNode[];
    links: SLink[];
}


export class D3Sankey extends React.Component <ID3SankeyProps, ID3SankeyState> {
    private svgRef?: SVGElement | null;


    constructor(props: ID3SankeyProps)
	{
		super(props);
    this.state = {
      threshold: 0,
      rangeValues: [0, 0],
      checked: false
    }
  }
  
    public componentDidMount() {
      const [min, max] = this.getMinMax2();
      // const [min2, max2] = this.getMinMax2();
      let normalizedData:ID3SankeyItem[] = R.filter((item) => item.Wert >= this.state.threshold, this.props.data);
      let data1 :ID3SankeyItem[] = R.filter((item) => item.Wert <= this.state.rangeValues[0] &&item.Wert >= min, this.props.data);
      let data2 :ID3SankeyItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[1] &&item.Wert <= max, this.props.data);
      let dataFilterSmall: ID3SankeyItem[] = R.concat(data1, data2);
      let dataFilterLarge :ID3SankeyItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[0] && item.Wert <= this.state.rangeValues[1], this.props.data);
      let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;
      let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData

      if (data) {this.drawSankeyChart(data, this.props.theme)}
      }

      public shouldComponentUpdate (nextProps: ID3SankeyProps, nextState: ID3SankeyState) {

        return  nextProps.data !== null || nextProps.data !== undefined  || nextProps.data !== this.props.data || nextProps.theme !== this.props.theme || nextState.threshold !==this.state.threshold  || nextState.rangeValues !==this.state.rangeValues || nextState.checked !== this.state.checked || nextProps.width !== this.props.width || nextProps.height !== this.props.height     
        }
        
        public componentDidUpdate(){
          const [min, max] = this.getMinMax2();
          // const [min2, max2] = this.getMinMax2();
          let normalizedData:ID3SankeyItem[] = R.filter((item) => item.Wert >= this.state.threshold, this.props.data);
          let data1 :ID3SankeyItem[] = R.filter((item) => item.Wert <= this.state.rangeValues[0] &&item.Wert >= min, this.props.data);
          let data2 :ID3SankeyItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[1] &&item.Wert <= max, this.props.data);
          let dataFilterSmall: ID3SankeyItem[] = R.concat(data1, data2);
          let dataFilterLarge :ID3SankeyItem[] = R.filter((item) => item.Wert >= this.state.rangeValues[0] && item.Wert <= this.state.rangeValues[1], this.props.data);
          let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;
          let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData
      
          this.removePreviousChart();
          this.drawSankeyChart(data, this.props.theme);
        }
    
    
        public removePreviousChart(){
          const chart = document.getElementById('sankey');
          if (chart) {
            while(chart.hasChildNodes())
            if (chart.lastChild) {
              chart.removeChild(chart.lastChild);
            }
          }
        }
 
        // DRAW D3 CHART
        private drawSankeyChart (data: ID3SankeyItem[], theme: string) { 
          const svg = select(this.svgRef!);        
      
          let MARGIN = {TOP: 10, RIGHT: 100, BOTTOM: 10, LEFT: 100}
          let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
          let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;

          const colorsBlue = ["#92c5de", "#2166ac","#4393c3"]
          const colorsRed = ["#b2182b", "#f4a582", "#d6604d"]
          const colorsBlueRed = ["#92c5de","#f4a582","#4e525c"]

          svg.append("svg")
          .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
          .attr("height", HEIGHT)
  
          let chart = svg.append("g")
            .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
            .attr("id", "chartArea")

          let nach = data.map(d => d["Nach"]);
          let von = data.map(d => d["Von"]);
          if (von.length > 0 && nach.length > 0 )
          {
            let checkIndx = (ar1:string[], ar2:string[])=> {  
              for(let i=0;i<ar1.length;i++){ 
                if (ar1[i] === ar2[i] ){
                  return i
                } 
              } 
             }
    
          let values =data.map(d=> d.Wert);
          let indx = checkIndx(von, nach)
   
          let maxIdx: any = d3.max(data, (d,i) => { if (d) return i})   

          let colorsFunction = (x:any, clrs:string[] )=> {
              let arrCol = new Array((indx !== undefined)? x+1 : x+2);
              arrCol.fill(clrs[0]); 
              if (typeof(indx) === "number"){
                arrCol[indx] =clrs[1] 
                arrCol[arrCol.length-1] = clrs [1]
              } else {
                arrCol[arrCol.length - 2] = clrs [1]
                arrCol[arrCol.length - 1] = clrs [1]
              } return arrCol
            }

          let colorsVon:string[] = colorsFunction(nach.length, colorsBlue)
          let colorsNach:string[] = colorsFunction(von.length, colorsRed)
          
          if (theme === "Von")
          {
            let nodesAr = data.map((d,i) => ({
              nodeId: i,
              name: d["Nach"],
              negative: +d.Wert
            }))
            let nameSource = von[0]
            let valueSource = ()=> {
              return (typeof(indx) === "number")? values[indx] : 0
            }
            let nodeVon = {
              nodeId: +(maxIdx+1),
              name: nameSource,
              negative: +valueSource
            }
            nodesAr.push( nodeVon)

            let nodesArPlus = data.map((d,i) => ({
              nodeId: i,
              name: d["Nach"],
              negative: +d.Wert
            }))
  
            let nodeVonZero = {
              nodeId: +(maxIdx+2),
              name: nameSource,
              negative: 0
            }
            nodesArPlus.push(nodeVon, nodeVonZero)
       
            let linksF = (dat:any) => {
                let l
                l = dat.map((d:any, i:number) => ({
                    source: +(maxIdx+1),
                    target: +i,
                    value: +d.Wert,
                    negative: +d.Wert
                }))
                return l
              }

            let linkVonZero = {
              source: +(maxIdx+1),
              target: +(maxIdx+2),
              value: 0,
              negative: 0
            }
        
            let linksAr = linksF(data);
            let linksArPlus = linksF(data);
            linksArPlus.push(linkVonZero);
        
            const dataSankey:DAG = (indx === undefined)? {
              "nodes" : nodesArPlus,
              "links": linksArPlus
            } :
            {
                "nodes" : nodesAr,
                "links": linksAr
            }
       
            let sankey = d3Sankey.sankey()
            .nodeWidth(24)
            .nodePadding(10)
            .extent([[1, 1], [WIDTH - 1 , HEIGHT - 6 ]]);
        
        
            let link:any = chart.append("g")
            .attr("class", "links")
            .attr("fill", "none")
            .attr("stroke-opacity", 0.5)
            .selectAll("path");
        
            let node:any = chart.append("g")
            .attr("class", "nodes")
            .attr("font-family", "sans-serif")
            .attr("font-size", 13)
            .selectAll("g");
      
          
            sankey(dataSankey);
      
            link = link
              .data(dataSankey.links)
              .enter().append("path")
              .attr("d", d3Sankey.sankeyLinkHorizontal())
              .attr("stroke-width", function (d: any) { return Math.max(1, d.width); })
              .style("stroke", colorsBlue[2])
              .on('mouseover', function() {
                  d3.select(d3.event.currentTarget).style('stroke-opacity', 0.9);
                })
              .on('mouseout', function() {
                  d3.select(d3.event.currentTarget).style('stroke-opacity', 0.5);
                });;
      
            link.append("title")
              .text(function (d: any) { return d.source.name + " → " + d.target.name + "\n" + d.value; });
      
            node = node
              .data(dataSankey.nodes)
              .enter().append("g");
        
            node.append("rect")
              .attr("x", function (d: any) { return d.x0; })
              .attr("y", function (d: any) { return d.y0; })
              .attr("height", function (d: any) { return d.y1 - d.y0; })
              .attr("width", function (d: any) { return d.x1 - d.x0; })
              .attr("fill", function (d: any) { return colorsVon[d.index] })
              .style("stroke", function(d:any) { let col:any = d3.rgb(colorsBlue[1]); return col.darker(); })
              .style("stroke-width", 2)
              .on("mouseover", function(d:any) {
                  link
                    .filter(function(dd:any, i:number) { return dd.source.name !== dataSankey.nodes[i].name && dd.target.name !== dataSankey.nodes[i].name })
                    .selectAll("path")
                    .transition()
                      .style('opacity', 0.1);
                  // fade other groups
                  node
                    .filter(function(dd:any, i:number) { return dd.name !== dataSankey.nodes[i].name })
                    .selectAll("rect")
                    .transition()
                      .style("opacity", 0.1);
                })
              .on("mouseout", function(d:any) {
                  link.selectAll("path")
                    .transition()
                      .style('opacity', 1);
                  // unfade groups
                  node.selectAll("rect")
                    .transition()
                      .style("opacity", 1);
                });
         
            node.filter(function(d:any) { return d.value != 0; })
              .append("text")
              .attr("x", function (d: any) { return d.x0 - 6; })
              .attr("y", function (d: any) { return (d.y1 + d.y0) / 2; })
              .attr("dy", "0.35em") //0.35
              .attr("text-anchor", "end")
              .text(function (d: any) { return d.name; })
              .filter(function (d: any) { return d.x0 < WIDTH / 2; })
              .attr("x", function (d: any) { return d.x1 + 6; })
              .attr("text-anchor", "start");
      
            node.append("title")
              .text(function (d: any) { return d.name + "\n" + d.negative; });
        
          }
          else if (theme === "Nach")
          {
        
          let nodesAr = data.map((d,i) => ({
              nodeId: i,
              name: d["Von"],
              negative: +d.Wert
          }))
    
          let nameTarget = nach[0]
          let valueTarget = ()=> {
            if (typeof(indx) === "number")
            {return values[indx]}
          }
    
          let nodeNach = {
              nodeId: +(maxIdx+1),
              name: nameTarget,
              negative: +valueTarget
          }
          nodesAr.push(nodeNach)
        
          let nodesArPlus = data.map((d,i) => ({
              nodeId: i,
              name: d["Von"],
              negative: +d.Wert
          }))
      
            let nodeNachZero = {
              nodeId: +(maxIdx+2),
              name: nameTarget,
              negative: 0
          }
          nodesArPlus.push(nodeNach, nodeNachZero)
    
          let linksF = (dat:any) => {
              let l
              l = dat.map((d:any, i:number) => ({
                  target: +(maxIdx+1),
                  source: +i,
                  value: +d.Wert,
                  negative: +d.Wert
              }))
              return l
          }
 
          let linkNachZero = {
            source: +(maxIdx+2),
            target: +(maxIdx+1),
            value: 0,
            negative: 0
          }
    
          let linksAr = linksF(data);
          let linksArPlus = linksF(data);
          linksArPlus.push(linkNachZero);
      
          const dataSankey:DAG = (indx === undefined)? {
            "nodes" : nodesArPlus,
            "links": linksArPlus
          } :
          {
              "nodes" : nodesAr,
              "links": linksAr
          }
 
          let sankey = d3Sankey.sankey()
          .nodeWidth(24)
          .nodePadding(10)
          .extent([[1, 1], [WIDTH - 1 , HEIGHT - 6 ]]);
      
          let link:any = chart.append("g")
          .attr("class", "links")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.5)
          .selectAll("path");
      
          let node:any = chart.append("g")
          .attr("class", "nodes")
          .attr("font-family", "sans-serif")
          .attr("font-size", 13)
          .selectAll("g");
      
          sankey(dataSankey);
    
          link = link
            .data(dataSankey.links)
            .enter().append("path")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .attr("stroke-width", function (d: any) { return Math.max(1, d.width); })
            .style("stroke", colorsRed[2])
            .on('mouseover', function() {
                d3.select(d3.event.currentTarget).style('stroke-opacity', 0.9);
              })
            .on('mouseout', function() {
                d3.select(d3.event.currentTarget).style('stroke-opacity', 0.5);
              });;
    
          link.append("title")
            .text(function (d: any) { return d.source.name + " → " + d.target.name + "\n" + d.value; });
    
          node = node
            .data(dataSankey.nodes)
            .enter().append("g");
    
          node.append("rect")
            .attr("x", function (d: any) { return d.x0; })
            .attr("y", function (d: any) { return d.y0; })
            .attr("height", function (d: any) { return d.y1 - d.y0; })
            .attr("width", function (d: any) { return d.x1 - d.x0; })
            .attr("fill", function (d: any) { return colorsNach[d.index] })
            .style("stroke", function(d:any) { let col:any = d3.rgb(colorsRed[0]); return col.darker(); })
            .style("stroke-width", 2)
            .on("mouseover", function(d:any) {
                link
                  .filter(function(dd:any, i:number) { return dd.source.name !== dataSankey.nodes[i].name && dd.target.name !== dataSankey.nodes[i].name })
                  .selectAll("path")
                  .transition()
                    .style('opacity', 0.1);
                node
                  .filter(function(dd:any, i:number) { return dd.name !== dataSankey.nodes[i].name })
                  .selectAll("rect")
                  .transition()
                    .style("opacity", 0.1);
              })
            .on("mouseout", function(d:any) {
                link.selectAll("path")
                  .transition()
                    .style('opacity', 1);
                node.selectAll("rect")
                  .transition()
                    .style("opacity", 1);
              });
    
          node.filter(function(d:any) { return d.value != 0; })
          .append("text")
            .attr("x", function (d: any) { return d.x0 - 6; })
            .attr("y", function (d: any) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em") //0.35
            .attr("text-anchor", "end")
            .text(function (d: any) { return d.name; })
            .filter(function (d: any) { return d.x0 < WIDTH / 2; })
            .attr("x", function (d: any) { return d.x1 + 6; })
            .attr("text-anchor", "start");
    
          node.append("title")
            .text(function (d: any) { return d.name + "\n" + d.negative; });
  
          } 
          else if (theme == "Saldi") {

          let nodesAr = data.map((d,i) => ({
              nodeId: i,
              name: d["Von"],
              negative: +d.Wert
          }))
      
          let nameSource = nach[0]
          let valueTarget = ()=> {
            if (typeof(indx) === "number")
            {return values[indx]}
          }
      
          let nodeNach = {
              nodeId: +(maxIdx+1),
              name: nameSource,
              negative: +valueTarget
          }
          nodesAr.push(nodeNach)
        
          let arrAbsolute = (ar:any[]) => { for(let i=0;i<ar.length;i++){
            if (ar[i] < 0 ){
                  ar[i] = Math.abs(ar[i])
                } 
              } return ar
            } 

          // let negativeIdx = (ar:any[]) => { 
          //     let idx: number[] = new Array(0)
          //     for(let i=0;i<ar.length;i++) {
          //       if (ar[i] < 0 ){
          //         idx[i] = 0
          //       } else {
          //         idx[i] = 1
          //       }
          //     }return idx
          //   } 

          let absValues = arrAbsolute(values)
    
    
          let linksF = (dat:any) => {
              let l
              l = dat.map((d:any, i:number) => ({
                  source: +(maxIdx+1),
                  target: +i,
                  value: absValues[i],
                  negative: +d.Wert
              }))
              return l
            }
      
    
          let linksAr = linksF(data);    
        
          const dataSankey:DAG = {
              "nodes" : nodesAr,
              "links": linksAr
          }    
          
          let sankey = d3Sankey.sankey()
          .nodeWidth(24)
          .nodePadding(10)
          .extent([[1, 1], [WIDTH - 1 , HEIGHT - 6 ]]);
    
    
          let link:any = chart.append("g")
          .attr("class", "links")
          .attr("fill", "none")
          .attr("stroke-opacity", 0.5)
          .selectAll("path");
    
          let node:any = chart.append("g")
          .attr("class", "nodes")
          .attr("font-family", "sans-serif")
          .attr("font-size", 13)
          .selectAll("g");
    
        
          sankey(dataSankey);
    
          link = link
            .data(dataSankey.links)
            .enter().append("path")
            .attr("d", d3Sankey.sankeyLinkHorizontal())
            .attr("stroke-width", function (d: any) { return Math.max(1, d.width); })
            .style("stroke", function (d:any){return d.negative < 0 ? colorsBlueRed[0] : colorsBlueRed [1]})
            .on('mouseover', function() {
                d3.select(d3.event.currentTarget).style('stroke-opacity', 0.9);
              })
            .on('mouseout', function() {
                d3.select(d3.event.currentTarget).style('stroke-opacity', 0.5);
              });;
    
          link.append("title")
            .text(function (d: any) { return d.source.name + " → " + d.target.name + "\n" + d.negative; });    
    
          node = node
            .data(dataSankey.nodes)
            .enter().append("g");
    
          node.append("rect")
            .attr("x", function (d: any) { return d.x0; })
            .attr("y", function (d: any) { return d.y0; })
            .attr("height", function (d: any) { return d.y1 - d.y0; })
            .attr("width", function (d: any) { return d.x1 - d.x0; })
            .attr("fill", function (d: any, i: number) {return d.negative === 0  || i === maxIdx+1 ? colorsBlueRed[2]: d.negative < 0 ? colorsBlueRed[0] : colorsBlueRed [1] })
            .style("stroke", function(d:any) { let col:any = d3.rgb(colorsBlue[1]); return col.darker(); })
            .style("stroke-width", 2)
            .on("mouseover", function(d:any) {
                link
                  .filter(function(dd:any, i:number) { return dd.source.name !== dataSankey.nodes[i].name && dd.target.name !== dataSankey.nodes[i].name })
                  .selectAll("path")
                  .transition()
                    .style('opacity', 0.1);
                node
                  .filter(function(dd:any, i:number) { return dd.name !== dataSankey.nodes[i].name })
                  .selectAll("rect")
                  .transition()
                    .style("opacity", 0.1);
              })
            .on("mouseout", function(d:any) {
                link.selectAll("path")
                  .transition()
                    .style('opacity', 1);
                node.selectAll("rect")
                  .transition()
                    .style("opacity", 1);            
              });
    
          node.filter(function(d:any) { return d.value != 0; })
          .append("text")
            .attr("x", function (d: any) { return d.x0 - 6; })
            .attr("y", function (d: any) { return (d.y1 + d.y0) / 2; })
            .attr("dy", "0.35em") //0.35
            .attr("text-anchor", "end")
            .text(function (d: any) { return d.name; })
            .filter(function (d: any) { return d.x0 < WIDTH / 2; })
            .attr("x", function (d: any) { return d.x1 + 6; })
            .attr("text-anchor", "start");
    
        node.append("title")
            .text(function (d: any) { console.log("node.title d: " + d); return d.index === maxIdx+1 ? d.name : d.name + "\n" + d.negative; });
          }
        }
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

	private getMinMax(): [number, number]
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
		return [min, second_max + 1];
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
  private getInitialValuesSliderSaldi(): [number, number]
  {
    let [min, max] = this.getMinMax2();
    let rangeValues: [number, number] = this.state.rangeValues;
    if (this.state.rangeValues[0] == 0) rangeValues[0] = min;
    if (this.state.rangeValues[1] == 0) rangeValues[1] = max;
    if (this.state.rangeValues[0] < min) rangeValues[0] = min;
    if (this.state.rangeValues[0] > max) rangeValues[0] = min;
    if (this.state.rangeValues[1] < min) rangeValues[1] = max;
    if (this.state.rangeValues[1] > max) rangeValues[1] = max;
    if (this.state.rangeValues[0] > this.state.rangeValues[1]) rangeValues[1] = max , rangeValues[0] = min;
 
    return rangeValues;
  }
    
  public render() {
    const { width, height } = this.props;
    const [min, max] = this.getMinMax2();
      // const [min2, max2] = this.getMinMax2();
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
                <svg id='sankey' width={width} height={height} ref={ref => (this.svgRef = ref)} />
        </div>
			</div>
        
      );
    }

}

