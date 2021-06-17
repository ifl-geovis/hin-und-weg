import * as React from 'react';
import Classification from '../../data/Classification';
import R from 'ramda';

import * as d3 from 'd3';
import { select } from 'd3-selection';

export interface ID3IndexValuesChartItem {
	label: string;
	result: number;
	index: number;
	yearSelect: string;
}

export interface ID3IndexValuesChartProps {
	db: alaSQLSpace.AlaSQL;
	location: string | null;
	theme: string;
	yearsAvailable: string[];
	locations: string[];
	vizID: number;
	 baseViewId: number;
	 data: ID3IndexValuesChartItem [];
	 width: number;
	height: number;
	referenceYear: string;
	referenceLocation: string;
	type: string;
	yearsSelected:string;
}
interface ID3IndexValuesChartState {
	percent: boolean;
}

export class D3IndexValuesChart extends React.Component<ID3IndexValuesChartProps, ID3IndexValuesChartState> {
	private svgRef?: SVGElement | null;
	private svgID?: string;

	constructor(props: ID3IndexValuesChartProps) {
		super(props);
		this.state = {
			percent: false
		};

	}

	public componentDidMount() {
		this.svgID = this.setSvgId(this.props.vizID, this.props.baseViewId);

		let data = this.props.data;
		let dataSorted =  this.sortData(data);

		if (data) {
			this.drawIndxValChart(data, this.props.theme);
		}
	}
	public shouldComponentUpdate(nextProps: ID3IndexValuesChartProps) {
		return (
			nextProps.data !== this.props.data ||
			nextProps.referenceYear !== this.props.referenceYear ||
			nextProps.referenceLocation !== this.props.referenceLocation ||
			nextProps.theme !== this.props.theme ||
			nextProps.width !== this.props.width ||
			nextProps.height !== this.props.height ||
			nextProps.type !== this.props.type

		);
	}

	public componentDidUpdate() {

		let data = this.props.data;
		let dataSorted =  this.sortData(data);
		this.removePreviousChart(this.svgID);
		this.drawIndxValChart(data, this.props.theme);
	}

	private setSvgId(vizId: number, BVId: number) {
		let svgID = 'IndxValChart' + vizId + BVId;
		return svgID;
	}

	private sortData(data: ID3IndexValuesChartItem[]) {

		function compareStrings(a:string, b:string) {
			a = a.toLowerCase();
			b = b.toLowerCase();

			return (a < b) ? -1 : (a > b) ? 1 : 0;
		  }

		  data.sort(function(a, b) {
			return compareStrings(a.label, b.label);
		  })

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
	private drawIndxValChart(data: ID3IndexValuesChartItem[], theme: string) {
		const svgIndxValChart = select(this.svgRef!);
		console.log("reference year: " + this.props.referenceYear);
		console.log(" yearsSelected: " + this.props.yearsSelected);

		// let heightResponsive = data.length <= 10 ? data.length*50 : data.length * 25;
		const labels = data.map((d) => d.label);
		let maxNameLength = Math.max(...labels.map(el => el ? el.length : 50));
		let marginResponsive =  this.props.type === 'year' ? maxNameLength*10 : maxNameLength*8 ; // +10		
		let MARGIN = { TOP: 75, RIGHT: 15, BOTTOM: marginResponsive, LEFT: 80 }; //50
				let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
		let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;

		const classification = Classification.getCurrentClassification();
		let positiveColor = classification.getZeitreihenPositiveColors()[0];
		let negativeColor = classification.getZeitreihenNegativeColors()[0];
		let NaNcolor = classification.getMissingColor();

		svgIndxValChart
			.append('svg')
			.attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
			.attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);


		let indxValChart = svgIndxValChart.append('g').attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);
		let xAxisGroup = indxValChart.append('g').attr('transform', `translate(0, ${HEIGHT})`);
		let yAxisGroup = indxValChart.append('g');

		const indexValues = data.map((d) => d.index);

		let checkRef = (ar1:string[], ref1:string, ref2:string) => {
			let n:number | null = null;
			 for(let i=0;i<ar1.length;i++)
				{
				  if (ar1[i] === ref1 || ar1[i] === ref2 ){
				n=i;
					 return n
				  }
				}
		  }
		const refLabelIndx = checkRef(labels, this.props.referenceYear , this.props.referenceLocation  );
		const results = data.map((d) => d.result);
		const calculateIfNaN: any = () =>  {if (typeof(refLabelIndx) === "number"){ return results[refLabelIndx] === undefined || results[refLabelIndx] === NaN}};
		
		const ifRefNaN = calculateIfNaN();

		const calculateIfYearSelected : any = () =>  { return ( R.contains(this.props.referenceYear, this.props.yearsSelected)) ? true : false};
		const ifYearSelected = calculateIfYearSelected();
		console.log("ifYearSelected: " + ifYearSelected);

		const calculateIfPercentage: any = () =>  {if (typeof(refLabelIndx) === "number"){ return indexValues[refLabelIndx] === 0 ? false : true}};
		const percentage: boolean = calculateIfPercentage();

		const maxIndex: any = d3.max(data, (d,i) => {
			return d.index
		});
		const maxIndexOrValue: any = (maxIndex:any) =>  {if (typeof(refLabelIndx) === "number"){return indexValues[refLabelIndx] === 0 ? maxIndex : maxIndex*100}};
		  const maxIndex2: number = maxIndexOrValue(maxIndex);

		const minIndex: any = d3.min(data, (d) => {
			return d.index
		});
		const minIndexOrValue: any = (minIndex:any) =>  {if (typeof(refLabelIndx) === "number"){return indexValues[refLabelIndx] === 0 ? minIndex : minIndex*100}};
		const minIndex2: number = minIndexOrValue(minIndex);

		const warnText = "Achtung, der gewählte Indexwert ist gleich 0. ";
		const warnText2 = "Es kann kein prozentualer Bezug hergestellt werden. ";
		const warnText3 = "Dargestellt sind absolute Werte!";
		const warnText4 = "Achtung, der gewählte Indexwert ist NaN. ";
		const warnText5 = "Achtung, das Bezugsjahr wird nicht unter den verfügbaren Jahren ausgewählt."

		  let textWidth = 0;

		let warningText = indxValChart.append("text")
				.attr("x", (10))
				.attr("y", 0 - (MARGIN.TOP / 4))
				.attr("width", WIDTH)
				.attr("text-anchor", "start")
				.style("font-size", "16px")
				.attr("font-weight", 800) // between 100 - 900
				.text( percentage === false && this.props.type === "location" ||percentage === false && this.props.type === "year" && ifYearSelected === true ?  (warnText + warnText2 + warnText3) : " " );

		let warningText2 = indxValChart.append("text")
				.attr("x", (10))
				.attr("y", 0 - (MARGIN.TOP / 4)) //0 - (MARGIN.TOP / 3)
				.attr("text-anchor", "start")
				.style("font-size", "16px")
				.attr("font-weight", 800) // between 100 - 900
					 .text( " " );

		  let warningText3 = indxValChart.append("text")
				.attr("x", (10))
				.attr("y", 0 - (MARGIN.TOP / 4)) //0 - (MARGIN.TOP / 3)
				.attr("text-anchor", "start")
				.style("font-size", "16px")
				.attr("font-weight", 800) // between 100 - 900
				.text( " " );


		let warningText4 = indxValChart.append("text")
				.attr("x", (10))
				.attr("y", 0 - (MARGIN.TOP / 4))
				.attr("width", WIDTH)
				.attr("text-anchor", "start")
				.style("font-size", "16px")
				.attr("font-weight", 800) // between 100 - 900
				.text( ifRefNaN ?   (warnText4 + warnText2 ) : " " );

		let warningText5 = indxValChart.append("text")
				.attr("x", (10))
				.attr("y", 0 - (MARGIN.TOP / 4))
				.attr("width", WIDTH)
				.attr("text-anchor", "start")
				.style("font-size", "16px")
				.attr("font-weight", 800) // between 100 - 900
				.text( ifYearSelected === false && this.props.type === "year" ?    warnText5  : " " );

				if (warningText !== null && warnText2 !== null && warnText3 !== null && percentage === false && this.props.type === "location" 
				|| warningText !== null && warnText2 !== null && warnText3 !== null && percentage === false && ifYearSelected === true && this.props.type === "year" ) { // || warningText !== null && warnText2 !== null && warnText3 !== null && ifYearSelected === false
					let		bboxt =  warningText.node()
					let bbox;
					if (bboxt !== null){
								bbox = bboxt.getBBox();
						 let rect = indxValChart.insert('rect','text')
						.attr('x', bbox.x  )
						.attr('y', bbox.y -25 - 25)
						.attr('width', bbox.width + 10 )
						.attr('height', bbox.height +25 + 25)
						.style("fill", "#f78928");
					textWidth = bbox.width;
						  }

				
						  // || warningText4 !== null && warnText2 !== null  && ifRefNaN

					warningText.text(  WIDTH >= textWidth ? ( warnText + warnText2 + warnText3) : WIDTH >= 670 ?  warnText + warnText2 : warnText  )
					.attr("y", (WIDTH >= textWidth ? 0 - (MARGIN.TOP / 4) :WIDTH > 670 ? 0 - (MARGIN.TOP / 4)*2 : 0 - (MARGIN.TOP / 4)*3));

						  warningText2.text(WIDTH < 670 ?  warnText2 : " " )
					.attr("y", (WIDTH < 670 ? 0 - (MARGIN.TOP / 4)*2 : 0 - (MARGIN.TOP / 4)));

						  warningText3.text(WIDTH < textWidth ?  warnText3 :" ");

				}
				if (warningText4 !== null && warnText2 !== null && ifRefNaN === true ) { //&& percentage === false
					let		bboxt =  warningText4.node()
					let bbox;
					if (bboxt !== null){
								bbox = bboxt.getBBox();
						 let rect = indxValChart.insert('rect','text')
						.attr('x', bbox.x  )
						.attr('y', bbox.y -25 - 25)
						.attr('width', bbox.width + 10 )
						.attr('height', bbox.height +25 + 25)
						.style("fill", "#f78928");
					textWidth = bbox.width;
						  }

						  warningText4.text(  WIDTH >= textWidth ? ( warnText4 + warnText2) : WIDTH >= 670 ?  warnText4 + warnText2 : warnText4  )
						  .attr("y", (WIDTH >= textWidth ? 0 - (MARGIN.TOP / 4) :WIDTH > 670 ? 0 - (MARGIN.TOP / 4)*2 : 0 - (MARGIN.TOP / 4)*3));
	  
								warningText2.text(WIDTH < 670 ?  warnText2 : " " )
						  .attr("y", (WIDTH < 670 ? 0 - (MARGIN.TOP / 4)*2 : 0 - (MARGIN.TOP / 4)));
	  
					  }

					  if (warningText5 !== null  && ifYearSelected === false && this.props.type === "year"   ) { 
						let		bboxt =  warningText5.node()
						let bbox;
						if (bboxt !== null){
									bbox = bboxt.getBBox();
							 let rect = indxValChart.insert('rect','text')
							.attr('x', bbox.x  )
							.attr('y', bbox.y -25 - 25)
							.attr('width', bbox.width + 10 )
							.attr('height', bbox.height +25 + 25)
							.style("fill", "#f78928");
						textWidth = bbox.width;
							  }
	
							//   warningText4.text(  WIDTH >= textWidth ? ( warnText4 + warnText2) : WIDTH >= 670 ?  warnText4 + warnText2 : warnText4  )
							//   .attr("y", (WIDTH >= textWidth ? 0 - (MARGIN.TOP / 4) :WIDTH > 670 ? 0 - (MARGIN.TOP / 4)*2 : 0 - (MARGIN.TOP / 4)*3));
		  
							// 		warningText2.text(WIDTH < 670 ?  warnText2 : " " )
							//   .attr("y", (WIDTH < 670 ? 0 - (MARGIN.TOP / 4)*2 : 0 - (MARGIN.TOP / 4)));
		  
						  }
		

		if (theme === 'Von') {

			const domain = data.map(d => d.label);
			let offsetDomain = (maxIndex2 - minIndex2)/ data.length;

			const x = d3.scaleBand()
			.domain(domain.sort(d3.ascending))
			.range([0, WIDTH])
			.padding(0.25);

			const y = d3
				.scaleLinear()
				.domain([maxIndex2 + offsetDomain, minIndex2 - offsetDomain])
				.range([0, HEIGHT]);




				// gridlines in x axis function
			let make_x_gridlines = () => {
				return d3.axisBottom(x);
			};

			// gridlines in y axis function
			let make_y_gridlines = () => {
				return d3.axisLeft(y);
			};
			const yAxisCall = d3.axisLeft(y);
			yAxisGroup.call(yAxisCall).attr('class', 'axis axis--y').style('font-size', '12px');

			const xAxisCall = d3.axisBottom(x);
			xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x')
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", 0)
			.attr("transform", "rotate(-90)")
			.style('font-size', '12px');

			xAxisGroup.selectAll('.tick')
			.each(function(d, i) {
				if(i === refLabelIndx) {
					d3.select(this)
						.selectAll('text')
						.attr('font-weight', 'bold')
						.style('fill', 'black')
						.style('font-size', '13px')
					}
			});

			  // text label for the y axis
			const xAxisName = indxValChart.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - MARGIN.LEFT)
				.attr("x",0 - (HEIGHT / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text(percentage === true ? "%" : "Wert");

			// add the X gridlines
			indxValChart
				.append('g')
				.classed('gridLine', true)
				.attr('transform', 'translate(0,' + HEIGHT + ')')
				.style('fill', 'none')
				.call(
					make_x_gridlines()
						.tickSize(-HEIGHT)
						.tickFormat(() => '')
				);

			// add the Y gridlines
			indxValChart
				.append('g')
				.classed('gridLine', true)
				.call(
					make_y_gridlines()
						.tickSize(-WIDTH)
						.tickFormat(() => '')
				);

				// Add the valueline path.
			let lineGenerator = d3.line<ID3IndexValuesChartItem>()
			// .defined(function (d) { return d.index !== undefined; })

			.x(function(d,i) {
				const xCoordinate = x(d.label)
				if (xCoordinate) {
					return xCoordinate + x.bandwidth()/2
				}
				return 0
				})
				.y( d => y(  d.index === undefined ? 0 : percentage === false ?  d.index :  d.index*100));
				// .y( d => y(  percentage === false ? d.index === undefined ? 0: d.index : d.index === undefined ? 0: d.index*100));

			let g = indxValChart.append("g")
			.attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
			.datum(data);

				let linegraph1 = indxValChart.append("path")
				.datum(data);

				let stopPoint = y(100)*100/HEIGHT + "%";
				let linearGradient = g.append("linearGradient")
				.attr("id", "line-gradient")
				.attr("gradientUnits", "userSpaceOnUse")
				.attr("x1", 0)
				.attr("y1", y(maxIndex2 + offsetDomain))
				.attr("x2", 0)
				.attr("y2", y(minIndex2 - offsetDomain));

				linearGradient.selectAll("stop")
				.data([
					 {offset: "0%", color: positiveColor},
					 {offset: stopPoint, color: positiveColor},
					 {offset:  stopPoint, color: negativeColor},
					 {offset: "100%", color: negativeColor}
				])
				.enter().append("stop")
				.attr("offset", function(d) { return d.offset; })
				.attr("stop-color", function(d) { return d.color; });

			 linegraph1
			.attr("d", lineGenerator)
			.attr("stroke", "url(#line-gradient)")
			.attr("stroke-width", 2.5)
			.attr("fill", "none");

			linegraph1.exit().remove();

			//Update
			linegraph1
			.attr("d", lineGenerator)
			.attr("stroke", "url(#line-gradient)")
			.attr("stroke-width", 2.5)
			.attr("fill", "none");
			//Enter
			linegraph1
			.enter()
				.append("path")
				.attr("d", lineGenerator)
				.attr("fill", "none")
				.attr("stroke", "url(#line-gradient)")
				.attr("stroke-width", 1)


			  indxValChart.append("line")
				.attr("x1", 0)
				.attr("x2", WIDTH )
				.attr("stroke", "#3a403d")
				.attr("stroke-width", "1px")
				.attr("y1", y(100))
				.attr("y2", y(100));

			 const circlesGraph = indxValChart.selectAll('circle')
				.data(data)
				.enter()
				.append('circle');

			circlesGraph
			// .filter(function(d) { return d.index !== undefined })

				.attr('r', (d,i) => { return i === refLabelIndx ? 4 : 3})
				.attr('cx',( d,i) => {
					const xCoordinate = x(d.label)
				if (xCoordinate) {
					return xCoordinate + x.bandwidth()/2
				}
				return 0
				})
				.attr('cy', d => y( d.index === undefined ? 0 : percentage === false ? d.index : d.index*100))
				.attr('fill', (d,i) => { return i === refLabelIndx ? "black": d.index === undefined ? NaNcolor : d.index*100 < 100 ? negativeColor : positiveColor})
				.attr('stroke', 'black');


			const formatRound =d3.format(".2f");
			circlesGraph.append("title")
			circlesGraph.select("title")
					.text(function(d, i) {
					let t:string
					t =  "Index: " + (percentage === false? d.index : formatRound(d.index*100)) + (percentage === false || d.index === undefined ? " " : "%")
					+ "\n" + "Wert: " + d.result
					return t
				})


		} else if (theme === 'Nach') {
			const domain = data.map(d => d.label);
			let offsetDomain = (maxIndex2 - minIndex2)/ data.length;

			const x = d3.scaleBand()
			.domain(domain.sort(d3.ascending))
			.range([0, WIDTH])
			.padding(0.25);

			const y = d3
				.scaleLinear()
				.domain([maxIndex2 + offsetDomain, minIndex2 - offsetDomain])
				.range([0, HEIGHT]);


				// gridlines in x axis function
			let make_x_gridlines = () => {
				return d3.axisBottom(x);
			};

			// gridlines in y axis function
			let make_y_gridlines = () => {
				return d3.axisLeft(y);
			};
			const yAxisCall = d3.axisLeft(y);
			yAxisGroup.call(yAxisCall).attr('class', 'axis axis--y').style('font-size', '12px');

			const xAxisCall = d3.axisBottom(x);
			xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x')
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", 0)
			.attr("transform", "rotate(-90)")
			.style('font-size', '12px');

			xAxisGroup.selectAll('.tick')
			.each(function(d, i) {
				if(i === refLabelIndx) {
					d3.select(this)
						.selectAll('text')
						.attr('font-weight', 'bold')
						.style('fill', 'black')
						.style('font-size', '13px')
					}
			});

			  // text label for the y axis
			const xAxisName = indxValChart.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - MARGIN.LEFT)
				.attr("x",0 - (HEIGHT / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text(percentage === true ? "%" : "Wert");

			// add the X gridlines
			indxValChart
				.append('g')
				.classed('gridLine', true)
				.attr('transform', 'translate(0,' + HEIGHT + ')')
				.style('fill', 'none')
				.call(
					make_x_gridlines()
						.tickSize(-HEIGHT)
						.tickFormat(() => '')
				);

			// add the Y gridlines
			indxValChart
				.append('g')
				.classed('gridLine', true)
				.call(
					make_y_gridlines()
						.tickSize(-WIDTH)
						.tickFormat(() => '')
				);

				// Add the valueline path.
			let lineGenerator = d3.line<ID3IndexValuesChartItem>()
			.x(function(d,i) {
				const xCoordinate = x(d.label)
				if (xCoordinate) {
					return xCoordinate + x.bandwidth()/2
				}
				return 0
				})
			.y( d => y( d.index === undefined ? 0 : percentage === false ? d.index : d.index*100));

			let g = indxValChart.append("g")
			.attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
			.datum(data);

				let linegraph1 = indxValChart.append("path")
				.datum(data);

				let stopPoint = y(100)*100/HEIGHT + "%";
				let linearGradient = g.append("linearGradient")
				.attr("id", "line-gradient")
				.attr("gradientUnits", "userSpaceOnUse")
				.attr("x1", 0)
				.attr("y1", y(maxIndex2 + offsetDomain))
				.attr("x2", 0)
				.attr("y2", y(minIndex2 - offsetDomain));

				linearGradient.selectAll("stop")
				.data([
					 {offset: "0%", color: positiveColor},
					 {offset: stopPoint, color: positiveColor},
					 {offset:  stopPoint, color: negativeColor},
					 {offset: "100%", color: negativeColor}
				])
				.enter().append("stop")
				.attr("offset", function(d) { return d.offset; })
				.attr("stop-color", function(d) { return d.color; });

				linegraph1
			.attr("d", lineGenerator)
			.attr("stroke", "url(#line-gradient)")
			.attr("stroke-width", 2.5)
			.attr("fill", "none");

			linegraph1.exit().remove();

			//Update
			linegraph1
			.attr("d", lineGenerator)
			.attr("stroke", "url(#line-gradient)")
			.attr("stroke-width", 2.5)
			.attr("fill", "none");
			//Enter
			linegraph1
			.enter()
				.append("path")
				.attr("d", lineGenerator)
				.attr("fill", "none")
				.attr("stroke", "url(#line-gradient)")
				.attr("stroke-width", 1)


				indxValChart.append("line")
				.attr("x1", 0)
				.attr("x2", WIDTH )
				.attr("stroke", "#3a403d")
				.attr("stroke-width", "1px")
				.attr("y1", y(100))
				.attr("y2", y(100));

			 const circlesGraph = indxValChart.selectAll('circle')
				.data(data)
				.enter()
				.append('circle');

			circlesGraph
				.attr('r', (d,i) => { return i === refLabelIndx ? 4 : 3})
				.attr('cx',( d,i) => {
					const xCoordinate = x(d.label)
				if (xCoordinate) {
					return xCoordinate + x.bandwidth()/2

				}
				return 0
				})

				.attr('cy', d => y( d.index === undefined ? 0 :  percentage === false ? d.index : d.index*100))
				.attr('fill', (d,i) => { return i === refLabelIndx ? "black": d.index === undefined ? NaNcolor : d.index*100 < 100 ? negativeColor : positiveColor})
				.attr('stroke', 'black');


					 const formatRound =d3.format(".2f");
					 circlesGraph.append("title")
					 circlesGraph.select("title")
								.text(function(d, i) {
								let t:string
								t =  "Index: " + (percentage === false? d.index : formatRound(d.index*100)) + (percentage === false || d.index === undefined ? " " : "%")
								+ "\n" + "Wert: " + d.result
								return t
						  })


		} else if (theme == 'Saldi') {
			const domain = data.map(d => d.label);
			let offsetDomain = (maxIndex2 - minIndex2)/ data.length;

			const x = d3.scaleBand()
			.domain(domain.sort(d3.ascending))
			.range([0, WIDTH])
			.padding(0.25);

			const y = d3
				.scaleLinear()
				.domain([maxIndex2 + offsetDomain, minIndex2 - offsetDomain])
				.range([0, HEIGHT]);

				// gridlines in x axis function
			let make_x_gridlines = () => {
				return d3.axisBottom(x);
			};

			// gridlines in y axis function
			let make_y_gridlines = () => {
				return d3.axisLeft(y);
			};
			const yAxisCall = d3.axisLeft(y);
			yAxisGroup.call(yAxisCall).attr('class', 'axis axis--y').style('font-size', '12px');

			const xAxisCall = d3.axisBottom(x);
			xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x')
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", 0)
			.attr("transform", "rotate(-90)")
			.style('font-size', '12px');

			xAxisGroup.selectAll('.tick')
			.each(function(d, i) {
				if(i === refLabelIndx) {
					d3.select(this)
						.selectAll('text')
						.attr('font-weight', 'bold')
						.style('fill', 'black')
						.style('font-size', '13px')
					}
			});

			  // text label for the y axis
			const xAxisName = indxValChart.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 0 - MARGIN.LEFT)
				.attr("x",0 - (HEIGHT / 2))
				.attr("dy", "1em")
				.style("text-anchor", "middle")
				.text(percentage === true ? "%" : "Wert");

			// add the X gridlines
			indxValChart
				.append('g')
				.classed('gridLine', true)
				.attr('transform', 'translate(0,' + HEIGHT + ')')
				.style('fill', 'none')
				.call(
					make_x_gridlines()
						.tickSize(-HEIGHT)
						.tickFormat(() => '')
				);

			// add the Y gridlines
			indxValChart
				.append('g')
				.classed('gridLine', true)
				.call(
					make_y_gridlines()
						.tickSize(-WIDTH)
						.tickFormat(() => '')
				);

				// Add the valueline path.
			let lineGenerator = d3.line<ID3IndexValuesChartItem>()
			.x(function(d,i) {
				// const xCoordinate = x(labels[i])
				const xCoordinate = x(d.label)

				if (xCoordinate) {
					return xCoordinate + x.bandwidth()/2
				}
				return 0
				})
			// .x(function(d, i) { return x(i); })
			.y( d => y(  d.index === undefined ? 0 : percentage === false ? d.index : d.index*100));


			let g = indxValChart.append("g")
			.attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
			.datum(data);

				let linegraph1 = indxValChart.append("path")
				.datum(data);

				let stopPoint = y(100)*100/HEIGHT + "%";
				let linearGradient = g.append("linearGradient")
				.attr("id", "line-gradient")
				.attr("gradientUnits", "userSpaceOnUse")
				.attr("x1", 0)
				.attr("y1", y(maxIndex2 + offsetDomain))
				.attr("x2", 0)
				.attr("y2", y(minIndex2 - offsetDomain));

				linearGradient.selectAll("stop")
				.data([
					 {offset: "0%", color: positiveColor},
					 {offset: stopPoint, color: positiveColor},
					 {offset:  stopPoint, color: negativeColor},
					 {offset: "100%", color: negativeColor}
				])
				.enter().append("stop")
				.attr("offset", function(d) { return d.offset; })
				.attr("stop-color", function(d) { return d.color; });

			 linegraph1
			.attr("d", lineGenerator)
			.attr("stroke", "url(#line-gradient)")
			.attr("stroke-width", 2.5)
			.attr("fill", "none");

			linegraph1.exit().remove();

			//Update
			linegraph1
			.attr("d", lineGenerator)
			.attr("stroke", "url(#line-gradient)")
			.attr("stroke-width", 2.5)
			.attr("fill", "none");
			//Enter
			linegraph1
			.enter()
				.append("path")
				.attr("d", lineGenerator)
				.attr("fill", "none")
				.attr("stroke", "url(#line-gradient)")
				.attr("stroke-width", 1)


			  indxValChart.append("line")
				.attr("x1", 0)
				.attr("x2", WIDTH )
				.attr("stroke", "#3a403d")
				.attr("stroke-width", "1px")
				.attr("y1", y(100))
				.attr("y2", y(100));

			const circlesGraph = indxValChart.selectAll('circle')
				.data(data)
				.enter()
				.append('circle');

			circlesGraph
				.attr('r', (d,i) => { return i === refLabelIndx ? 4 : 3})
				.attr('cx',( d,i) => {
					const xCoordinate = x(d.label)
				if (xCoordinate) {
					return xCoordinate + x.bandwidth()/2

				}
				return 0
				})

				.attr('cy', d => y( d.index === undefined ? 0 :  percentage === false ? d.index : d.index*100))
				.attr('fill', (d,i) => {console.log("label + indx: " + d.label + " : " + d.index === undefined ) ; return i === refLabelIndx ? "black": d.index === undefined ? NaNcolor : d.index*100 < 100 ? negativeColor : positiveColor})
				.attr('stroke', 'black');


					 const formatRound =d3.format(".2f");
					 circlesGraph.append("title")
					 circlesGraph.select("title")
								.text(function(d, i) {
								let t:string
								t =  "Index: " + (percentage === false? d.index : formatRound(d.index*100)) + (percentage === false || d.index === undefined ? " " : "%")
								+ "\n" + "Wert: " + d.result
								return t
						  })
		}
	}



	public render() {
		const { width, height } = this.props;

		return (
			<div className="p-grid">

				<div className="p-col-12">
				</div>
				<div className="p-col-12">
					<svg id={this.svgID} width={width} height={height} ref={(ref) => (this.svgRef = ref)} />
				</div>
			</div>
		);
	}
}
