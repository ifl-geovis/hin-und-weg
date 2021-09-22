import * as React from 'react';

import * as d3 from 'd3';
import { select } from 'd3-selection';

export interface ID3HistogramProps {
	theme: string;
	width: number;
	height: number;
	vizID: number;
	baseViewId: number;
    yearsSelected: string[];
    positive_scales: any[];
    positive_scales_short: any[];
    positiveValues: any[];
    positive_colors: any[];
	positive_scales_string: string[]
	negative_scales: any[];
    negative_scales_short: any[];
    negativeValues: any[];
    negative_colors: any[];
	negative_scales_string: string[]
	algorithm: string;

}


export class D3Histogram extends React.Component<ID3HistogramProps> {
	private svgRef?: SVGElement | null;
    private svgID?: string; 

	public componentDidMount() {
		this.svgID = this.setSvgId(this.props.vizID, this.props.baseViewId);
			this.drawHistogram(this.props.theme);
	}
	public shouldComponentUpdate(nextProps: ID3HistogramProps) {
		return (
			nextProps.positiveValues !== this.props.positiveValues ||
            nextProps.positive_scales !== this.props.positive_scales ||
            nextProps.positive_scales_short !== this.props.positive_scales_short ||
            nextProps.positive_colors !== this.props.positive_colors ||
			nextProps.theme !== this.props.theme ||
			nextProps.algorithm !== this.props.algorithm ||
			nextProps.width !== this.props.width ||
			nextProps.height !== this.props.height 
		);
	}

	public componentDidUpdate() {
		this.removePreviousChart(this.svgID);
		this.drawHistogram( this.props.theme);
	}

	private setSvgId(vizId: number, BVId: number) {
		let svgID = 'Histogram' + vizId + BVId;
		return svgID;
	}

	private removePreviousChart(id: string | undefined) {
		if (typeof id === 'string') {
			const chart = document.getElementById(id);
			if (chart) {
				while (chart.hasChildNodes())
					if (chart.lastChild) {
						chart.removeChild(chart.lastChild);
					}
			}
		}
	}

	// DRAW D3 CHART
	private drawHistogram(theme: string) {
	const svgHistogram = select(this.svgRef!);

	let MARGIN = {TOP: 20, RIGHT: 30, BOTTOM: 100, LEFT: 50}
    let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
    let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;

	svgHistogram
		.append('svg')
		.attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
		.attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

	const svgHisto = svgHistogram.append('g').attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

	const xAxisGroup = svgHisto.append('g').attr('transform', `translate(0, ${HEIGHT})`);

	const yAxisGroup = svgHisto.append('g').attr('transform', `translate(0, 0)`);
	const yAxisText = svgHisto.append('g').attr('transform', `translate(${-MARGIN.LEFT/2}, 0)`);     

	if (theme === 'Von' ) {
        const positive_colors = this.props.positive_colors;
		const pos_scales_string = this.props.positive_scales.map(String);
        const [min, max] = this.getMinMax2();

        let makeIntervalsString = (arr : any []) => {
			let intrvals = [];
				for (let i=0 ; i<arr.length-1 ; i++) {
					if (arr[i] !== undefined) {
						intrvals.push (arr[i] + " - " + arr[i+1]);
					} else {
						intrvals.push (arr[i]);
					}
				}
				return intrvals;
			};

		let intervalsString = makeIntervalsString(pos_scales_string);
		let numOfBins = this.props.positive_scales_short.length;
        let numOfValues = this.props.positiveValues.length;
		let bins = [];
		let binCount = 0;
			
		//Setup Bins
        for(let i = 0; i < numOfBins; i ++){
			  bins.push({
				binNum: binCount,
				minNum: this.props.positive_scales[i],
				maxNum: this.props.positive_scales[i+1],
				count: 0
			  })
			  binCount++;
			}
			
		//	Loop through data and add to bin's count
			for (let i = 0; i < this.props.positiveValues.length; i++){
				let item = this.props.positiveValues[i];
			  for (let j = 0; j < bins.length; j++){
				let bin = bins[j];
				if(i === 0 ? item >= bin.minNum :item > bin.minNum && item <= bin.maxNum){
					bin.count++;
				  break;  
				}
			  }  
			}
			
		let x = d3.scaleLinear()
			.domain([min , max ]) 
			.range([0, WIDTH]) 
		let xBand = d3.scaleBand()
		    .domain(intervalsString) 
		    .range([0, WIDTH])
		    .padding(0.1)

        let yMax : number | undefined= d3.max(bins, function(d){return d.count});
           
        if ( yMax !== undefined)
           { 
            const y = d3.scaleLinear()
            .domain([0,  Math.round((yMax)*100/numOfValues) + 1])
                     .range([HEIGHT, 0]);
            
            const yAxisCall = d3.axisLeft(y).ticks(15); // ticks(yMax + 1) 
                     yAxisGroup.call(yAxisCall).attr('class', 'axis axis--y').style('font-size', '12px');
         
            // text label for the y axis
            yAxisText.append("text")
            .attr("text-anchor", "middle") 
            .attr("transform", "translate(" + 0 + "," + (HEIGHT / 2) + ")rotate(-90)") 
            .text( "%");

			const xAxisCall = d3.axisBottom(xBand);
				xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x')
				    .selectAll("text")	
				    .style("text-anchor", "end")
				    .attr("dx", "-.8em")
				    .attr("dy", "-.5em") 
				    .attr("transform", "rotate(-90)")
				    .style('font-size', '10px'); 

            let bar = svgHisto.selectAll(".bar")
                .data(bins)
                .enter().append("g")
                .attr("class", "bar")
                
            bar.append("rect")
				    .attr('x', (d, i) => {
					const xBandCoordinate = xBand(intervalsString[i]);
                    if (xBandCoordinate) {
						return xBandCoordinate;
					}
					return null;
				})
                .attr("y", (d,i) => { return  y(Math.round((d.count)*100/numOfValues))})
				.attr("width", xBand.bandwidth())
				.attr("height", function(d:any) { return  (HEIGHT - y(Math.round((d.count)*100/numOfValues))); })
                .attr("fill", function(d, i) { return positive_colors[i] });
               
            bar.append("text")
				.attr("y",  function(d:any) {return  y(Math.round((d.count)*100/numOfValues)) - 3 ; })
				.attr('x', (d, i) => {
					const xBandCoordinate = xBand(intervalsString[i]);
					if (xBandCoordinate) {
						return xBandCoordinate + xBand.bandwidth()/2;
					}
					return null;
				})
                .attr("text-anchor", "middle")
                .text(function(d) {return  d.count ; })
                .style("font-size", "10px" )
                .attr("font-family", "Open Sans");
           
            bar.append("title")
            bar.select("title")
            .text(function(d) {return Math.round((d.count)*100/numOfValues) + "%"; })

        }
		} else if (theme === 'Nach') {
        const positive_colors = this.props.positive_colors;
		const pos_scales_string = this.props.positive_scales.map(String);
        const [min, max] = this.getMinMax2();

		let makeIntervalsString = (arr : any []) => {
			let intrvals = [];
				for (let i=0 ; i<arr.length-1 ; i++) { 
					if (arr[i] !== undefined) {
						intrvals.push (arr[i] + " - " + arr[i+1]);
					} else {
						intrvals.push (arr[i]);
					}
				}
				return intrvals;
			};

		let intervalsString = makeIntervalsString(pos_scales_string);
        let numOfBins = this.props.positive_scales_short.length;
        let numOfValues = this.props.positiveValues.length;
		let bins = [];
		let binCount = 0;
			
		//Setup Bins
		for(let i = 0; i < numOfBins; i ++){
			  bins.push({
				binNum: binCount,
				minNum: this.props.positive_scales[i],
				maxNum: this.props.positive_scales[i+1],
				count: 0
			  })
			  binCount++;
            }
            			
	    //	Loop through data and add to bin's count
		for (let i = 0; i < this.props.positiveValues.length; i++){
				let item = this.props.positiveValues[i];
			  for (let j = 0; j < bins.length; j++){
				let bin = bins[j];
				if(i === 0 ? item >= bin.minNum :item > bin.minNum && item <= bin.maxNum){
					bin.count++;
				  break;  
				}
			  }  
			}
			
		
		let x = d3.scaleLinear()
				.domain([min , max ]) 
				.range([0, WIDTH]) 
        let xBand = d3.scaleBand()
                .domain(intervalsString) 
                .range([0, WIDTH])
                .padding(0.1)

        let yMax : number | undefined= d3.max(bins, function(d){return d.count});
           
        if ( yMax !== undefined)
           { 
            const y = d3.scaleLinear()
            .domain([0,  Math.round((yMax)*100/numOfValues) + 1])
                     .range([HEIGHT, 0]);
            
            const yAxisCall = d3.axisLeft(y).ticks(yMax + 1); 
                     yAxisGroup.call(yAxisCall).attr('class', 'axis axis--y').style('font-size', '12px');
         
            // text label for the y axis
            yAxisText.append("text")
                .attr("text-anchor", "middle") 
                .attr("transform", "translate(" + 0 + "," + (HEIGHT / 2) + ")rotate(-90)") 
                .text( "%");

			const xAxisCall = d3.axisBottom(xBand);
				xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x')
					.selectAll("text")	
				   .style("text-anchor", "end")
				   .attr("dx", "-.8em")
				   .attr("dy", "-.5em") 
				   .attr("transform", "rotate(-90)")
				   .style('font-size', '10px'); 

            let bar = svgHisto.selectAll(".bar")
                .data(bins)
                .enter().append("g")
                .attr("class", "bar")
                
            bar.append("rect")
				.attr('x', (d, i) => {
					const xBandCoordinate = xBand(intervalsString[i]);
					if (xBandCoordinate) {
						return xBandCoordinate;
					}
					return null;
				})
                .attr("y", (d,i) => { return  y(Math.round((d.count)*100/numOfValues))})
				.attr("width", xBand.bandwidth())
				.attr("height", function(d:any) { return HEIGHT - y(Math.round((d.count)*100/numOfValues)); })
                .attr("fill", function(d, i) { return positive_colors[i] });
      
            bar.append("text")
				.attr("y",  function(d:any) {return  y(Math.round((d.count)*100/numOfValues)) - 3 ; })
				.attr('x', (d, i) => {
					const xBandCoordinate = xBand(intervalsString[i]);
					if (xBandCoordinate) {
						return xBandCoordinate + xBand.bandwidth()/2;
					}
					return null;
				})
                .attr("text-anchor", "middle")
                .text(function(d) {return d.count; })
                .style("font-size", "10px" )
                .attr("font-family", "Open Sans");
           
            bar.append("title")
            bar.select("title")
                .text(function(d) {return  Math.round((d.count)*100/numOfValues) + "%"; })

        }
        } else if (theme == 'Saldi') {
		const positive_colors = this.props.positive_colors;
        const negative_colors = this.props.negative_colors;
        const colors = negative_colors.concat(positive_colors);
		const pos_scales_string = this.props.positive_scales.map(String);
		const neg_scales_string = this.props.negative_scales.map(String);
        const [min, max] = this.getMinMax2();

		let makeIntervalsString = (arr : any []) => {
			let intrvals = [];
				for (let i=0 ; i<arr.length-1 ; i++) { 
					if (arr[i] !== undefined) {
						intrvals.push (arr[i] + " - " + arr[i+1]);
					} else {
						intrvals.push (arr[i]);
					}
				}
				return intrvals;
			};

		let intervalsStringPos = makeIntervalsString(pos_scales_string);
        let intervalsStringNegative = makeIntervalsString(neg_scales_string);            
        let intervalsString = intervalsStringNegative.concat(intervalsStringPos);

		let numOfBinsPos = this.props.positive_scales_short.length;
        let numOfBinsNeg = this.props.negative_scales_short.length;
        let numOfBins = numOfBinsNeg + numOfBinsPos;
			
		let numOfValuesPos = this.props.positiveValues.length;
        let numOfValuesNeg = this.props.negativeValues.length;
        let numOfValues = numOfValuesNeg + numOfValuesPos;
        
        let binsPos = [];
        let binPosCount = 0;
                
        //Setup Bins
		for(let i = 0; i < numOfBinsPos; i ++){
                binsPos.push({
				binNum: binPosCount,
				minNum: this.props.positive_scales[i],
				maxNum: this.props.positive_scales[i+1],
				count: 0
			  })
			  binPosCount++;
			}
			
		//	Loop through data and add to bin's count
		for (let i = 0; i < this.props.positiveValues.length; i++){
				let item = this.props.positiveValues[i];
			  for (let j = 0; j < binsPos.length; j++){
				let bin = binsPos[j];
				if(i === 0 ? item >= bin.minNum :item > bin.minNum && item <= bin.maxNum){
					bin.count++;
				  break;  
				}
			  }  
			}
		
            
         let binsNeg = [];
        let binNegCount = 0;
        
        //Setup Bins
            for(let i = 0; i < numOfBinsNeg; i ++){
                    binsNeg.push({
                    binNum: binNegCount,
                    minNum: this.props.negative_scales[i],
                    maxNum: this.props.negative_scales[i+1],
                    count: 0
                  })
                  binNegCount++;
                }
                
        //	Loop through data and add to bin's count
            for (let i = 0; i < this.props.negativeValues.length; i++){
                    let item = this.props.negativeValues[i];
                  for (let j = 0; j < binsNeg.length; j++){
					let bin = binsNeg[j];
					if(j === binsNeg.length-1 ? item >= bin.minNum && item <= bin.maxNum :item >= bin.minNum && item < bin.maxNum){
                        bin.count++;
                      break;  
                    }
                  }  
                }
                
        const bins = binsNeg.concat(binsPos);
		let x = d3.scaleLinear()
			.domain([min, max ])
			.range([0, WIDTH]) 
		let xBand = d3.scaleBand()
		    .domain(intervalsString) 
		    .range([0, WIDTH])
		    .padding(0.1)

        let yMax : number | undefined= d3.max(bins, function(d){return d.count});

            
        if ( yMax !== undefined)
           { 
            const y = d3.scaleLinear()
            .domain([0,  Math.round((yMax)*100/numOfValues) + 1])
                     .range([HEIGHT, 0]);
            
            const yAxisCall = d3.axisLeft(y).ticks(yMax + 1);
                     yAxisGroup.call(yAxisCall).attr('class', 'axis axis--y').style('font-size', '12px');
         
            // text label for the y axis
            yAxisText.append("text")
            .attr("text-anchor", "middle") 
            .attr("transform", "translate(" + 0 + "," + (HEIGHT / 2) + ")rotate(-90)") 
            .text("%");

			const xAxisCall = d3.axisBottom(xBand);
				xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x')
				    .selectAll("text")	
				    .style("text-anchor", "end")
				    .attr("dx", "-.8em")
				    .attr("dy", "-.5em") 
				    .attr("transform", "rotate(-90)")
				    .style('font-size', '10px'); 

            let bar = svgHisto.selectAll(".bar")
                .data(bins)
                .enter().append("g")
                .attr("class", "bar")
            
            bar.append("rect")
				.attr('x', (d, i) => {
					const xBandCoordinate = xBand(intervalsString[i]);
					if (xBandCoordinate) {
						return xBandCoordinate;
					}
					return null;
				})
                .attr("y", (d,i) => {return  y(Math.round((d.count)*100/numOfValues))})
				.attr("width", xBand.bandwidth())
				.attr("height", function(d:any) { return  HEIGHT - y(Math.round((d.count)*100/numOfValues)); })
                .attr("fill", function(d, i) { return colors[i] });
               
            bar.append("text")
                .attr("dy", ".75em")
                .attr("y", (d,i) => {return y(Math.round((d.count)*100/numOfValues)) - 10})
				.attr('x', (d, i) => {
					const xBandCoordinate = xBand(intervalsString[i]);
					if (xBandCoordinate) {
						return xBandCoordinate + xBand.bandwidth()/2;
					}
					return null;
				})
                .attr("text-anchor", "middle")
                .text(function(d) {return d.count; })
                .style("font-size", "10px" )
                .attr("font-family", "Open Sans");
           
            bar.append("title")
            bar.select("title")
            .text(function(d) {return  Math.round((d.count)*100/numOfValues) + "%"; })
			}
		}
	}

	private getMinMax2(): [number, number] {
		let max = Number.MIN_VALUE;
		let second_max = Number.MIN_VALUE;
		let min = Number.MAX_VALUE;
		if (this.props.positiveValues) {
			for (let item of this.props.positiveValues) {
				if (item < min) {
					min = item;
				}
				if (item > max) {
					if (max > second_max) {
						second_max = max;
					}
					max = item;
				} else if (item > second_max) {
					second_max = item;
				}
			}
		}
		return [min, max + 1];
    }
    
   

	public render() {

		return (
			<div className="p-grid">
				
				<div className="p-col-12">
					<svg id={this.svgID} width={this.props.width} height={this.props.height} ref={(ref) => (this.svgRef = ref)} />
				</div>
			</div>
		);
	}
}
