import BaseData from "../../data/BaseData";
import * as React from 'react';
import { Slider } from 'primereact/slider';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from "primereact/radiobutton";
import Classification from '../../data/Classification';
import * as d3 from 'd3';
import { select } from 'd3-selection';
import R from 'ramda';
import Legend from '../elements/Legend';
import { InputText } from 'primereact/inputtext';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface ID3ChartItem {
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

export interface ID3ChartProps extends WithNamespaces{
	basedata: BaseData;
	data: ID3ChartItem[];
	theme: string;
	width: number;
	height: number;
	vizID: number;
	baseViewId: number;
	yearsSelected: string[];
	dataProcessing:string;
	positive_scales: number[] | null;
	negative_scales: number[] | null;
	positive_colors: string[];
	negative_colors: string[];

}
interface ID3ChartState {
	threshold: number;
	rangeValue1: number;
	rangeValue2: number;
	rangeValues: [number, number];
	selectedRadio: string;
	checked: boolean;
	checkedNoFilter: boolean;
	checkedNaN: boolean;
	sort: string;

}

// export 
class D3Chart extends React.Component<ID3ChartProps, ID3ChartState> {
	private svgRef?: SVGElement | null;
	private svgID?: string;

	constructor(props: ID3ChartProps) {
		super(props);
		this.state = {
			threshold: 0,
			rangeValue1: 0,
			rangeValue2: 0,
			rangeValues: [0, 0],
			selectedRadio: 'kleineWerte',
			checked: false,
			checkedNoFilter: false,
			checkedNaN: false,
			sort: "alphabetical",

		};
		this.sortData = this.sortData.bind(this);

	}

	public componentDidMount() {
		this.svgID = this.setSvgId(this.props.vizID, this.props.baseViewId);

		const [min, max] = this.getMinMax2();
		let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
		let data1: ID3ChartItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[0] && (wanderungsRate? item.Wert/1000 : item.Wert) >= min , this.props.data) : R.filter((item) => Number.isNaN((wanderungsRate? item.Wert/1000 : item.Wert)) || (wanderungsRate? item.Wert/1000 : item.Wert) <= this.state.rangeValues[0] && (wanderungsRate? item.Wert/1000 : item.Wert) >= min , this.props.data);
		let data2: ID3ChartItem[] = R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[1] && (wanderungsRate? item.Wert*1000 : item.Wert) <= max, this.props.data);
		let dataFilterSmall: ID3ChartItem[] = R.concat(data1, data2);
		let dataFilterLarge: ID3ChartItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[1],this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[1] || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
		let dataSaldi = this.state.checked === false ? dataFilterLarge : dataFilterSmall;
		let normalizedData: ID3ChartItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.threshold , this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.threshold || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
		let data = this.props.theme == 'Saldi' ? dataSaldi : normalizedData;
		this.sortData(data) 
		if (data) {
			this.drawBarChartH(data, this.props.theme);
		}
	}
	public shouldComponentUpdate(nextProps: ID3ChartProps, nextState: ID3ChartState) {
		return (
			nextProps.data !== this.props.data ||
			nextProps.theme !== this.props.theme ||
			nextState.checkedNoFilter !== this.state.checkedNoFilter ||
			nextState.checked !== this.state.checked ||
			nextProps.width !== this.props.width ||
			nextProps.height !== this.props.height ||
			nextState.threshold !== this.state.threshold ||
			nextState.rangeValues !== this.state.rangeValues ||
			nextState.selectedRadio !== this.state.selectedRadio ||
			nextState.checkedNaN !== this.state.checkedNaN ||
			nextProps.dataProcessing !== this.props.dataProcessing ||
			nextState.sort !== this.state.sort ||
			nextProps.yearsSelected !== this.props.yearsSelected ||
			nextProps.positive_scales !== this.props.positive_scales ||
			nextProps.negative_scales !== this.props.negative_scales ||
			nextProps.positive_colors !== this.props.positive_colors ||
			nextProps.negative_colors !== this.props.negative_colors 
		);
	}

	public componentDidUpdate(nextProps: ID3ChartProps, nextState: ID3ChartState){
		const [min, max] = this.getMinMax2();
		let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
		let threshold: number = this.state.checkedNoFilter ? min:  this.calculateCurrentThreshold();
		let rangeValues: [number, number] = this.state.checkedNoFilter ? [min, max]:  this.getInitialValuesSliderSaldi();

		if(nextProps.dataProcessing !== this.props.dataProcessing || nextProps.theme !== this.props.theme){
            rangeValues = [min, max];
            this.setState({ rangeValues: [min, max]});
            threshold = min;
			this.setState({threshold: min});		
         }
		let data1: ID3ChartItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) <= rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) >= min, this.props.data) : R.filter((item) => Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert))  || (wanderungsRate? item.Wert*1000 : item.Wert) <= rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) >= min, this.props.data);
		let data2: ID3ChartItem[] = R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= rangeValues[1] && (wanderungsRate? item.Wert*1000 : item.Wert) <= max, this.props.data);
		let dataFilterSmall: ID3ChartItem[] =  R.concat(data1, data2);
		let dataFilterLarge: ID3ChartItem[] = this.state.checkedNaN ? R.filter( (item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= rangeValues[1] , this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= rangeValues[1] || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
		let dataSaldi = this.state.checked === false ? dataFilterLarge : dataFilterSmall;
		let normalizedData: ID3ChartItem[] = this.state.checkedNaN ?  R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= threshold , this.props.data)  : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= threshold || Number.isNaN( item.Wert) , this.props.data);
		let data = this.props.theme == 'Saldi' ? dataSaldi : normalizedData;
		this.sortData(data) 
		this.removePreviousChart(this.svgID);
		this.drawBarChartH(data, this.props.theme);
	}

	private setSvgId(vizId: number, BVId: number) {
		let svgID = 'BarChart' + vizId + BVId;
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
	private drawBarChartH(data: ID3ChartItem[], theme: string) {
		let ascending: boolean = this.state.sort === "ascending";
        let descending: boolean = this.state.sort === "descending";
        let alphabetical: boolean = this.state.sort === "alphabetical";
		console.log("data D3 Chart start: " + JSON.stringify(data))
		const svgBarChart = select(this.svgRef!);
		let nach = data.map((d) => d.Nach);
		let von = data.map((d) => d.Von);
		let names = nach.concat(von);
		let maxNameLength = Math.max(...names.map((el) => (el ? el.length : 50)));
		let heightResponsive =
			data.length < 2 ? (this.state.checkedNaN ? data.length * 75 :data.length * 50) : 
			data.length == 2 ? data.length * 50 :
			data.length > 2 && data.length <= 5 ? data.length * 35 :
			data.length > 5 && data.length < 30 ? data.length * 25 :
			data.length * 20;


		// let MARGIN = {TOP: 20, RIGHT: 15, BOTTOM: 30, LEFT: maxNameLength*9}
		let MARGIN = { TOP: 20, RIGHT: 15, BOTTOM: 30, LEFT: maxNameLength > 3 ? maxNameLength * 9 : maxNameLength * 15 };
		let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
		let HEIGHT = heightResponsive - MARGIN.TOP - MARGIN.BOTTOM;
		const neutralcolor = '#f7f7f7';
		const bordercolor = '#525252';

		const classification = this.props.basedata.getClassification();

		let classColors = (data: ID3ChartItem[]) => {
			let colors = new Array(data.length);
			colors.fill('#000000');
			for (let i = 0; i < data.length; i++) {
				colors[i] = classification.getColor(data[i]);
			}
			return colors;
		};

		let hexcolor: string[] = classColors(data);

		let hexcolorAdd: string[] = classColors(data);
		hexcolorAdd.push('#f7f7f7');

		const colorsBlue = ['#92c5de', '#2166ac'];
		const colorsRed = ['#b2182b', '#f4a582'];

		svgBarChart
			.append('svg')
			.attr('width', WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
			.attr('height', HEIGHT + MARGIN.TOP + MARGIN.BOTTOM);

		let barChart = svgBarChart.append('g').attr('transform', `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`);

		let xAxisGroup = barChart.append('g').attr('transform', `translate(0, ${HEIGHT})`);

		let yAxisGroup = barChart.append('g');

		const max: any = d3.max(data, (d) => {
			if (d.Wert) return d.Wert;
		});
		const min: any = d3.min(data, (d) => {
			if (d.Wert) return d.Wert;
		});

		if (theme === 'Von') {
			const x = d3
				.scaleLinear()
				.domain([0, max])
				.range([0, WIDTH - 30]);

			const y = d3
				.scaleBand()
				.domain(data.map((d) => d.Nach))
				.range([0, HEIGHT])
				.padding(0.1);

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
			xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x');

			// add the X gridlines
			barChart
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
			barChart
				.append('g')
				.classed('gridLine', true)
				.call(
					make_y_gridlines()
						.tickSize(-WIDTH)
						.tickFormat(() => '')
				);
			let rects = barChart.append('g').attr('class', 'rects').selectAll('.bar').data(data);
			
		
			

			function select_axis_label(datum: ID3ChartItem) {
				return d3
					.select('.axis--y')
					.selectAll('text')
					.filter(function (x) {
						return x === datum.Nach;
					});
			}

			rects
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('height', y.bandwidth())
				.attr('y', (d) => {
					const yCoordinate = y(d.Nach);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('fill', function (d: any, i: number) {
					return hexcolor[i];
				})
				// .attr("fill", colorsBlue[1])
				.style('stroke', bordercolor)
				.style('stroke-opacity', 0.5)
				.attr('x', 0)
				.attr('width', (d) => x(d.Wert));

			rects.exit().transition().duration(500).attr('width', 0).attr('x', 0).remove();

			//Update
			rects
				.attr('y', (d) => {
					const yCoordinate = y(d.Nach);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('height', y.bandwidth())
				.attr('width', (d) => x(d.Wert));

			//Enter
			rects
				.enter()
				.append('rect')
				.attr('height', y.bandwidth())
				.attr('y', (d) => {
					const yCoordinate = y(d.Nach);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				// .attr("fill", colorsBlue[1])
				.attr('fill', function (d: any, i: number) {
					return hexcolor[i];
				})
				.style('stroke', bordercolor)
				.style('stroke-opacity', 0.5)
				.on('mouseover', function (d) {
					d3.select(this).attr('fill', '#bdbdbd');
					// .attr("fill", colorsBlue[0]);
					values
						.filter((dd) => dd === d)
						.attr('font-weight', 'bold')
						.style('fill', 'black');
					select_axis_label(d).attr('style', 'font-weight: bold;').style('font-size', '13px');
				})
				.on('mouseout', function (d, i) {
					d3.select(this)
						// .attr("fill", colorsBlue[1]);
						.attr('fill', function (dd: any, ii: number) {
							return hexcolor[i];
						});
					values
						.attr('font-weight', 'regular')
						// .style("fill", (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d");
						.style('fill', (d) => (x(d.Wert) - x(0) > 30 ? '#000000' : '#3a403d'));

					select_axis_label(d).attr('style', 'font-weight: regular;').style('font-size', '12px');
				})
				.attr('x', 0)
				.attr('width', (d) => x(d.Wert));

				const values = barChart
				.selectAll('.value')
				.data(data)
				.enter()
				.append('text')
				.attr('class', 'value')
				.attr('y', (d) => {
					const yCoordinate = y(d.Nach);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('dy', y.bandwidth() - 2.55)
				.attr('text-anchor', 'start') // (d) =>(x(d.Wert) - x(0)) > 30 ? "end" : "start")
				.style('fill', '#000000') // (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d")
				.text((d) => {
					return d['Wert'];
				})
				.style('font-size', '15px')
				.attr(
					'x',
					(d) => x(d.Wert) + 1 // ((x(d.Wert)) > 30 ? x(d.Wert) - 2 : x(d.Wert) + 1)
				);
				
				 

		} else if (theme === 'Nach') {
			const x = d3
				.scaleLinear()
				.domain([0, max])
				.range([0, WIDTH - 30]);

			const y = d3
				.scaleBand()
				.domain(data.map((d) => d.Von))
				.range([0, HEIGHT])
				.padding(0.1);

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
			xAxisGroup.call(xAxisCall).attr('class', 'axis axis--x');

			// add the X gridlines
			barChart
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
			barChart
				.append('g')
				.classed('gridLine', true)
				.call(
					make_y_gridlines()
						.tickSize(-WIDTH)
						.tickFormat(() => '')
				);
			function select_axis_label(datum: ID3ChartItem) {
				return d3
					.select('.axis--y')
					.selectAll('text')
					.filter(function (x) {
						return x === datum.Von;
					});
			}

			const rects = barChart.selectAll('.bar').data(data);

			rects
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('height', y.bandwidth())
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('fill', function (d: any, i: number) {
					return hexcolor[i];
				})
				// .attr("fill", colorsRed[0])
				.style('stroke', bordercolor)
				.style('stroke-opacity', 0.5)
				//  .style("stroke-width", .5)
				.attr('x', 0)
				.attr('width', (d) => x(d.Wert));

			rects.exit().transition().duration(500).attr('width', 0).attr('x', 0).remove();

			//Update
			rects
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('height', y.bandwidth())
				.attr('width', (d) => x(d.Wert));

			//Enter
			rects
				.enter()
				.append('rect')
				.attr('height', y.bandwidth())
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('fill', function (d: any, i: number) {
					return hexcolor[i];
				})
				// .attr("fill", colorsRed[0])
				.style('stroke', bordercolor)
				.style('stroke-opacity', 0.5)
				// .style("stroke-width", .5)
				.on('mouseover', function (d) {
					d3.select(this).attr('fill', '#bdbdbd'); // colorsRed[1]);
					values
						.filter((dd) => dd === d)
						.attr('font-weight', 'bold')
						.style('fill', 'black');
					select_axis_label(d).attr('style', 'font-weight: bold;').style('font-size', '13px');
				})
				.on('mouseout', function (d, i) {
					d3.select(this).attr('fill', function (dd: any, ii: number) {
						return hexcolor[i];
					});
					// .attr("fill", colorsRed[0]);
					values.attr('font-weight', 'regular').style('fill', (d) => (x(d.Wert) - x(0) > 30 ? '#000000' : '#3a403d'));
					select_axis_label(d).attr('style', 'font-weight: regular;').style('font-size', '12px');
				})
				.attr('width', (d) => x(d.Wert));
				
			const values = barChart
				.selectAll('.value')
				.data(data)
				.enter()
				.append('text')
				.attr('class', 'value')
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('dy', y.bandwidth() - 2.55)
				.attr('text-anchor', 'start') // (d) =>(x(d.Wert) - x(0)) > 30 ? "end" : "start")
				.style('fill', '#000000') // (d) => (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d")
				.text((d) => {
					return d['Wert'];
				})
				.style('font-size', '15px')
				.attr('x', (d) => x(d.Wert) + 1); // ((x(d.Wert)) > 30 ? x(d.Wert) - 2 : x(d.Wert) + 1));
		} else if (theme == 'Saldi') {
			const x = d3
				.scaleLinear()
				.domain([min, max])
				.nice()
				.range([32, WIDTH - 32]);

			if (min > 0) {
				x.domain([0, max]).nice();
			} else if (max < 0) {
				x.domain([min, 0]).nice();
			}

			const y = d3
				.scaleBand()
				.domain(data.map((d) => d['Von']))
				.rangeRound([0, HEIGHT])
				.padding(0.1);

			// gridlines in x axis function
			let make_x_gridlines = () => {
				return d3.axisBottom(x);
			};

			// gridlines in y axis function
			let make_y_gridlines = () => {
				return d3.axisLeft(y);
			};

			const yAxisCall = d3.axisLeft(y);
			yAxisGroup
				.call(yAxisCall)
				.attr('class', 'axis axis--y')
				// .selectAll(".tick text")
				.style('font-size', '12px');

			const xAxisCall = d3.axisBottom(x);
			xAxisGroup
				// .transition().duration(500)
				.call(xAxisCall)
				.attr('class', 'axis axis--x');

			// add the X gridlines
			barChart
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
			barChart
				.append('g')
				.classed('gridLine', true)
				.call(
					make_y_gridlines()
						.tickSize(-WIDTH)
						.tickFormat(() => '')
				);
			function select_axis_label(datum: ID3ChartItem) {
				return d3
					.select('.axis--y')
					.selectAll('text')
					.filter(function (x) {
						return x === datum.Von;
					});
			}

			//Data join
			const rects = barChart.selectAll('rect').data(data);
			rects
				.enter()
				.append('rect')
				.attr('class', 'bar')
				.attr('height', y.bandwidth())
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('fill', function (d: any, i: number) {
					return hexcolor[i];
				})
				// .attr("fill", function(d){ return d.Wert < 0 ? colorsBlue[1]: colorsRed[0]; })
				.style('stroke', bordercolor)
				.style('stroke-opacity', 0.5)
				.style('stroke-width', 0.5)
				.attr('x', (d) => {
					return d.Wert < 0 ? x(d['Wert']) : x(0);
				})
				.attr('width', (d) => {
					return d.Wert < 0 ? x(d.Wert * -1) - x(0) : x(d.Wert) - x(0);
				});

			// //Exit
			rects.exit().transition().duration(500).attr('width', 0).attr('x', WIDTH).remove();

			//Update
			rects
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('height', y.bandwidth())
				.attr('x', (d) => {
					return d.Wert < 0 ? x(d['Wert']) : x(0);
				})
				.attr('width', (d) => {
					return d.Wert < 0 ? x(d.Wert * -1) - x(0) : x(d.Wert) - x(0);
				});

			//Enter
			rects
				.enter()
				.append('rect')
				.attr('height', y.bandwidth())
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('fill', function (d: any, i: number) {
					return hexcolor[i];
				})
				// .attr("fill", function(d){ return d.Wert < 0 ? colorsBlue[1]: colorsRed[0]; })
				.style('stroke', bordercolor)
				.style('stroke-opacity', 0.5)
				.style('stroke-width', 0.5)
				.on('mouseover', function (d) {
					d3.select(this).attr('fill', function (dd) {
						return bordercolor;
					});
					// .attr("fill", function(dd){ return d.Wert < 0 ? colorsBlue[0]: colorsRed[1]; });
					values
						.filter((dd) => dd === d)
						.attr('font-weight', 'bold')
						.style('fill', 'black');
					select_axis_label(d).attr('style', 'font-weight: bold; ').style('font-size', '13px');
				})
				.on('mouseout', function (d: any, i: number) {
					d3.select(this).attr('fill', function (dd: any, ii: number) {
						return hexcolor[i];
					});

					// .attr("fill", function(){ return d.Wert < 0 ? colorsBlue[1]: colorsRed[0]; });
					values.attr('font-weight', 'regular').style('fill', function (d) {
						if (d.Wert < 0) {
							return x(d.Wert * -1) - x(0) > 30 ? '#3a403d' : '#3a403d';
							// return (x(d.Wert * -1) - x(0)) > 30 ? "#ffffff" : "#3a403d";
						} else {
							return x(d.Wert) - x(0) > 30 ? '#3a403d' : '#3a403d';
							// return (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d";
						}
					});
					select_axis_label(d).attr('style', 'font-weight: regular;').style('font-size', '12px');
				})
				.attr('x', (d) => {
					return d.Wert < 0 ? x(d['Wert']) : x(0);
				})
				.attr('width', (d) => {
					return d.Wert < 0 ? x(d.Wert * -1) - x(0) : x(d.Wert) - x(0);
				});

			barChart
				.append('line')
				.attr('y1', 0 + MARGIN.TOP)
				.attr('y2', HEIGHT - MARGIN.TOP)
				.attr('stroke', '#3a403d')
				.attr('stroke-width', '1px')
				.attr('x1', x(0))
				.attr('x2', x(0));

			const values = barChart
				.selectAll('.value')
				.data(data)
				.enter()
				.append('text')
				.attr('class', 'value')
				.attr('y', (d) => {
					const yCoordinate = y(d.Von);
					if (yCoordinate) {
						return yCoordinate;
					}
					return null;
				})
				.attr('dy', y.bandwidth() - 2.55)
				.attr('text-anchor', function (d) {
					if (d.Wert < 0) {
						return 'end'; // return (x(d.Wert * -1) - x(0)) > 30 ? "start" : "end";
					} else {
						return 'start'; // return (x(d.Wert) - x(0)) > 30 ? "end" : "start";
					}
				})
				.style('fill', '#000000')
				// .style("fill", function(d){
				//   if (d.Wert < 0){
				//     return (x(d.Wert * -1) - x(0)) > 30 ? "#ffffff" : "#3a403d";
				//   } else {
				//     return (x(d.Wert) - x(0)) > 30 ? "#ffffff" : "#3a403d";
				//   }
				//   })
				.style('font-size', '15px')
				.text(function (d) {
					return d.Wert;
				})
				.attr('x', (d) => {
					if (d.Wert < 0) {
						return x(d.Wert) - 1; // return (x(d.Wert * -1) - x(0)) > 30 ? x(d.Wert) + 2 : x(d.Wert) - 1;
					} else {
						return x(d.Wert) + 1; // return (x(d.Wert) - x(0)) > 30 ? x(d.Wert) - 2 : x(d.Wert) + 1;
					}
				});
		}
	}

	private getMinMax2(): [number, number] {
		let max = Number.MIN_VALUE;
		let second_max = Number.MIN_VALUE;
		let min = Number.MAX_VALUE;
		if (this.props.data) {
			for (let item of this.props.data) {
				if (item['Wert'] < min) {
					min = item['Wert'];
				}
				if (item['Wert'] > max) {
					if (max > second_max) {
						second_max = max;
					}
					max = item['Wert'];
				} else if (item['Wert'] > second_max) {
					second_max = item['Wert'];
				}
			}
		}
		let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
     	min = wanderungsRate ? min * 1000 : min;
      	max = wanderungsRate ? max * 1000 : max;
		return [min, max + 1];
	}

	private calculateCurrentThreshold(): number {
		let [min, max] = this.getMinMax2();
		// min = Math.round((min + Number.EPSILON) * 1000) / 1000;
		// max = Math.round((max + Number.EPSILON) * 1000) / 1000;
		let threshold: number = this.state.threshold;
		if (this.state.threshold == 0) threshold = min;
		if (this.state.threshold < min) threshold = min;
		if (this.state.threshold > max) threshold = max;
		return threshold;
	}
	private getInitialValuesSliderSaldi(): [number, number] {
		let [min2, max2] = this.getMinMax2();
		max2 = max2 - 1;
		let rangeValues: [number, number] = this.state.rangeValues;
		if (this.state.rangeValues[0] == 0) rangeValues[0] = min2;
		if (this.state.rangeValues[1] == 0) rangeValues[1] = max2;
		if (this.state.rangeValues[0] < min2) rangeValues[0] = min2;
		if (this.state.rangeValues[0] > max2) rangeValues[0] = min2;
		if (this.state.rangeValues[1] < min2) rangeValues[1] = max2;
		if (this.state.rangeValues[1] > max2) rangeValues[1] = max2;
		if (this.state.rangeValues[0] > this.state.rangeValues[1]) (rangeValues[1] = max2), (rangeValues[0] = min2);

		return rangeValues;
	}

	private sortData(data: ID3ChartItem[]): any[] {
		let ascending: boolean = this.state.sort === "ascending";
      	let descending: boolean = this.state.sort === "descending";
		let alphabetical: boolean = this.state.sort === "alphabetical";
		if(ascending){data.sort((data1: any, data2: any) => {
			let result; 
			if(isFinite(data1.Wert - data2.Wert)) {
				 result = data1.Wert - data2.Wert;
			  } else {
				isFinite(data1.Wert) ? result = 1 : result = -1;
			  }
			return (result); 
		});}
		if(descending){data.sort((data1: any, data2: any) => {
			let result; 
			if(isFinite(data2.Wert - data1.Wert)) {
				 result = data2.Wert - data1.Wert;
			  } else {
				isFinite(data1.Wert) ? result = -1 : result = 1;
			  }
			return (result); 
		});}
		if(alphabetical){data.sort((data1: any, data2: any) => {
			let dataField1 = this.props.theme ==="Von" ? data1.Nach : data1.Von;
			let dataField2 = this.props.theme ==="Von" ? data2.Nach : data2.Von;
			let result = dataField1 - dataField2;
			return (result); 
		});}
		return data;
	}


	public render() {
		const { width, height } = this.props;
		let [min, max] = this.getMinMax2();
        max = max-1;
		let threshold: number = this.state.checkedNoFilter ? min : this.calculateCurrentThreshold();
		let rangeValues: [number, number] = this.state.checkedNoFilter ? [min, max] : this.getInitialValuesSliderSaldi();
		// let saldiText: string = (this.state.checked === true)? ('ab ' + min + ' bis: ' + rangeValues[0] + '       und          ab: ' + rangeValues[1] + ' bis: ' + max) : ('ab ' + rangeValues[0] + ' bis: ' + rangeValues[1]);
		let rangeValue1: number = this.state.checkedNoFilter ? min : rangeValues[0];
		let rangeValue2: number = this.state.checkedNoFilter ? max : rangeValues[1];
		let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
		const {t}:any = this.props ;

		return (
			<div className="p-grid">
				<div className="p-col-4 noprint">
					<Checkbox
						onChange={(e: { value: any; checked: boolean }) => this.setState({ checked: e.checked })}
						checked={this.state.checked}
						disabled={this.props.theme === 'Saldi' ? false : true}
					/>
					<label className="p-checkbox-label">{t('charts.reverse')}</label>
				</div>
				<div className="p-col-4 noprint">
				<Checkbox
				  name = "saldiChordNoFilter"
				  id	= "saldiChordNoFilter"
				  onChange={(e: { value: any, checked: boolean }) => this.setState({checkedNoFilter: e.checked})}
				  checked={this.state.checkedNoFilter}
				/>
				<label className="p-checkbox-label">{t('charts.nofilter')}</label>
			 </div>
		  <div className="p-col-4 noprint">
				<Checkbox
				  name = "noNaN"
				  id	= "noNaN"
				  onChange={(e: { value: any, checked: boolean }) => this.setState({checkedNaN: e.checked})}
				  checked={this.state.checkedNaN}
				/>
				<label className="p-checkbox-label">{t('charts.noNaN')}</label>
			 </div>

				<div className="p-col-1 noprint" style={{ width: '3.5em' }}>
					{wanderungsRate ? min/1000 : min}
				</div>
				<div className="p-col-10 noprint">
					<div className={`banner ${this.props.theme == 'Saldi' ? this.state.checked === true ? 'slider-reversed' : "slider-saldi" : ''}`}>
						{this.props.theme == 'Saldi' ? (
							<Slider
								disabled={this.state.checkedNoFilter   ? true : false}
								min={min}
								max={max}
								value={this.state.checkedNoFilter  ? [min, max] : rangeValues }
								onChange={(e) => this.state.checkedNoFilter ? this.setState({rangeValues: [min, max  ]as [number, number]}) : this.setState({ rangeValues: e.value as [number, number] })}
								range={true}
							/>
						) : (
							<Slider
								disabled={this.state.checkedNoFilter   ? true : false}
								min={min}
								max={max}
								value={this.state.checkedNoFilter  ? min : threshold}
								orientation="horizontal"
								onChange={(e) => this.state.checkedNoFilter  ? this.setState({  threshold: min as number}) : this.setState({ threshold: e.value as number })}
							/>
						)}
					</div>
				</div>
				<div className="p-col-1 noprint" style={{ width: '3.5em' }}>
					{wanderungsRate ? max/1000 : max}
				</div>
				{/* <div className="p-col-12 p-justify-center">{this.props.theme == "Saldi" ? 'Anzeige Werte in Bereich: ' + saldiText : 'Anzeige ab Wert: ' + threshold  }</div> */}
				<div className="p-col-2 noprint">
					{this.props.theme == 'Saldi' ? this.state.checked ?
					t('charts.sliderSaldi1') + (wanderungsRate ?  min/1000 : min) + t('charts.sliderSaldi2') :
					// 'Anzeige Werte in Bereich: ab ' + (wanderungsRate ?  min/1000 : min) + ' bis ' :
					t('charts.sliderSaldi1') : t('charts.slider')}
					{/* 'Anzeige Werte in Bereich: ab ' : 'Anzeige ab Wert: '} */}
					</div>
				<div className="p-col-2 noprint">
					{this.props.theme == 'Saldi' ?
						<InputText
							value={wanderungsRate ? rangeValue1/1000 : rangeValue1}
							style={{ width: '6em' }}
							type="number"
							onChange={(e: any) => this.state.checkedNoFilter ? this.setState({rangeValues: [min as number, rangeValue2]}) : this.setState({ rangeValues: [e.target.value as number, rangeValue2] })}
						/>
					 :
						<InputText
							value={this.state.checkedNoFilter ? wanderungsRate ? min/1000 : min: wanderungsRate ? threshold/1000 : threshold}
							style={{ width: '10em' }}
							type="number"
							onChange={(e: any) => this.state.checkedNoFilter ? this.setState({ threshold: min as number }) : this.setState({ threshold: e.target.value as number })}
						/>
					}
				</div>
				<div className="p-col-2 noprint">{this.props.theme == 'Saldi' ? this.state.checked === true?
						t('charts.sliderSaldi3') : t('charts.sliderSaldi2') : ' '}
						{/* 'und ab ' : 'bis ' : ' '} */}
				</div>
				<div className="p-col-2 noprint">
					{this.props.theme == 'Saldi' ?
						<InputText
							value={wanderungsRate ? rangeValue2/1000 : rangeValue2}
							style={{ width: '6em' }}
							type="number"
							onChange={(e: any) => this.state.checkedNoFilter ? this.setState({ rangeValues: [rangeValue1, max as number] }) : this.setState({ rangeValues: [rangeValue1, e.target.value as number] })}
						/>
					 :
						<div className="p-col-2 p-offset-1"></div>}

				</div>
				<div className="p-col-2">{this.props.theme == "Saldi" && this.state.checked === true?
						'bis ' + wanderungsRate ? max/1000 : max : ' '} </div>
				
				<div className="p-col-12">
					<Legend basedata={this.props.basedata} showCenter="" yearsSelected={this.props.yearsSelected} />
				</div>
				<div className="p-col-4 noprint"> <RadioButton inputId='s1' value='alphabetical' name='sortBalken' onChange={(e: { value: string, checked: boolean }) => this.setState({sort: e.value})}  checked={this.state.sort === 'alphabetical'}  />  <label className="p-checkbox-label">{t('charts.alphabetical')}</label> </div>
				<div className="p-col-4 noprint"> <RadioButton inputId='s2' value='ascending' name='sortBalken' onChange={(e: { value: string, checked: boolean }) => this.setState({sort: e.value})} checked={this.state.sort === 'ascending'} /> <label className="p-checkbox-label">{t('charts.ascending')}</label>  </div>
				<div className="p-col-4 noprint"> <RadioButton inputId='s3' value='descending' name='sortBalken' onChange={(e: { value: string, checked: boolean }) => this.setState({sort: e.value})} checked={this.state.sort === 'descending'} /> <label className="p-checkbox-label">{t('charts.descending')}</label> </div>
				<div className="p-col-12">
					<svg id={this.svgID} width={width} height={height} ref={(ref) => (this.svgRef = ref)} />
				</div>
			</div>
		);
	}
}
export default withNamespaces()(D3Chart);
