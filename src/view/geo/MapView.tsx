import * as d3 from "d3";
import { Feature } from "geojson";
import R from "ramda";
import React from "react";
import Geodata from "../../model/Geodata";

export interface IMapViewProps
{
	items?: Array<{[name: string]: any}> | null;
	geodata: Geodata | null;
	nameField?: string | null;
	selectedLocation?: string | null;
	onSelectLocation: (newLocation: string) => void;
	showLabels: boolean;
	theme: string;
}

interface IMapViewState
{
	width: number;
	height: number;
}

export default class MapView extends React.Component<IMapViewProps, IMapViewState>
{

	// Taken from http://colorbrewer2.org/
	// http://colorbrewer2.org/?type=sequential&scheme=YlOrRd&n=9
	//protected colors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'];
	protected colors = ['#f7f7f7','#fddbc7','#f4a582','#d6604d','#b2182b','#67001f'];
	protected colorsPos = ['#fddbc7','#f4a582','#d6604d','#b2182b','#67001f'];
	//http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=11
	protected colorsAll = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7',"#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];

	protected all_colors = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7',"#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
	// http://colorbrewer2.org/?type=sequential&scheme=PuBu&n=9
	//protected negative_colors = ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"];
	protected negative_colors = ["#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
	protected neutral_color = '#ffffff';

	constructor(props: IMapViewProps)
	{
		super(props);
		this.state =
		{
			height: 700,
			width: 600,
		};
		this.pickColor = this.pickColor.bind(this);
	}

	public render(): JSX.Element
	{
		const [min, max] = this.getMinMax();
		let m= max;
		let mn = min;
		let col;
		let ymx;
		let ymn;
		if(this.props.theme ==="Saldi"){

					col = this.all_colors;
					ymx="5";
					ymn="295"
				}
		else if (this.props.theme ==="Von" || "Nach") {
					col = this.colors;
					ymn="5";
					ymx="170"
				}
		else {
			col = this.all_colors
		}
		return (
			<div className="p-grid">
				<svg className="p-col-10" width={this.state.width} height={this.state.height}>
					{this.createD3Map()}
					{this.createMapLabels()}
				</svg>
				<svg className="p-col-2" width="150" height="310">
					{/*this.createLegend(this.colors, 0)*/}
					{/*this.createLegend(this.negative_colors, 1)*/}
					<text y={ymx}>max: {m}</text>
					<svg y="10">{this.createValues(col, 0)}</svg>
					<text y={ymn}>min: {mn}</text>
				</svg>
			</div>
		);
	}

	private createLegend(colors: string[], offset: number): object[]
	{
		let y = 0;
		const indexedMap = R.addIndex(R.map);
		const boxes = indexedMap( (color, id: number): JSX.Element =>
		{
			let y = id * 24;
			let x = offset * 24;
			let c = color as string;
			return (<rect key={id} fill={c} stroke="#4d4d4d" width="24" height="24" x={x} y={y}></rect>);
		}, colors);
		return boxes;
	}

	private createValues(colors: string[], offset: number): object[]
	{

		const [min, max] = this.getMinMax();

		let y = 0;
		const indexedMap = R.addIndex(R.map);

			let legendScale:any;
			let legendScalePos:any;
			let legendScaleNeg:any;
			let dom;
			let domPos;
			let domNeg;
			let l:number;
			let lPos:number;
			let lNeg:number;

			let breaksPos:Array<number>;
			let breaksNeg:Array<number>;
			let breaksPosO:Array<number>;

			let breaks:Array<number>;
			let breaksO:Array<number> = [0];
			let breaks2:Array<number>;
			let lb;


		if(this.props.theme ==="Saldi"){

					legendScalePos = d3.scaleQuantize<string>().domain([1, max]).range(this.colorsPos);
					legendScaleNeg = d3.scaleQuantize<string>().domain([-min, 1]).range(this.negative_colors);

					domPos = legendScalePos.domain();
					domNeg = legendScaleNeg.domain();
					lPos = (domPos[1] - domPos[0])/legendScalePos.range().length;
					lNeg = (domNeg[1] - domNeg[0])/legendScaleNeg.range().length;

					breaksPos = d3.range(0, legendScalePos.range().length).map(function(i) { return i * lPos; }).reverse();
					breaksNeg = d3.range(0, legendScaleNeg.range().length).map(function(i) { return i * lNeg; });
					breaksPosO = breaksO.concat(breaksPos);
					breaks = breaksPosO.concat(breaksNeg);
					breaks2 = breaks.map(function(each_element){
					return Number(each_element.toFixed(1));
						});
				}
		else if (this.props.theme ==="Von" || "Nach") {
					 legendScale = d3.scaleQuantize<string>().domain([1, max]).range(this.colorsPos);
										  dom = legendScale.domain();
					l = (dom[1] - dom[0])/legendScale.range().length;
					breaksPos = d3.range(0, legendScale.range().length).map(function(i) { return i * l; });
					breaks = breaksO.concat(breaksPos);
					breaks2 = breaks.map(function(each_element){
					return Number(each_element.toFixed(1));
						});
				}
		else {
					 legendScale = d3.scaleQuantize<string>().domain([max, -min]).range(this.all_colors);
										  dom = legendScale.domain();
					l = (dom[1] - dom[0])/legendScale.range().length;
					breaks = d3.range(0, legendScale.range().length).map(function(i) { return i * l; });
					breaks2 = breaks.map(function(each_element){
					return Number(each_element.toFixed(1));
						});
		}

		const boxes = indexedMap( (color, id: number): JSX.Element =>
		{
			let y = id * 24;
			let x = offset * 24;
			let yt = y-2;
			let xt = x + 45;
			//let cc = color;

			let c = color as string;
			//let m = max;
			//let mn = min;
			//let t = "  ";

			return (<g key={id}>
				<rect fill={c} stroke="#4d4d4d" width="24" height="24" x={x} y={y}></rect>
				<text
				x={xt} y={yt}
				fill="black"
				fontSize="13"
				//fontWeight="bold"
				textAnchor="middle"
				>
					_ {breaks2[id]}
			 </text>
			 </g>);
		}, colors);
		return boxes;
	}

	private createD3Map(): object[]
	{
		const geodata = this.props.geodata;
		if (geodata == null)
		{
			return [
				<g key="no-geodata">
					<text transform={"translate(" + this.state.width / 2 + "," + this.state.height / 2 + ")"} style={{ fill: "#000000", stroke: "#aaaaaa"}}>Keine Geodaten geladen</text>
				</g>,
			];
		}
		const projection = d3.geoMercator().fitSize([this.state.width, this.state.height],geodata.getFeatureCollection());
		const path = d3.geoPath().projection(projection);
		const indexedMap = R.addIndex(R.map);
		const features = indexedMap( (feature, id: number): JSX.Element =>
		{
			const f = feature as Feature;
			let title = "";
			if (this.props.nameField == null)
			{
				const firstProp = R.head(R.keys(f.properties!));
				title = R.prop(firstProp!, f.properties!);
			}
			else
			{
				title = R.prop(this.props.nameField, f.properties!);
			}
			const style = this.getStyleFor(title, f);
			return (
				<g key={id}>
					<path d={path(f) || undefined} style={style} key={id} onClick={(e) =>
						{
							this.props.onSelectLocation(title);
						}}/>
				</g>
			);
		} , geodata.getFeatures());
		return features;
	}

	private createMapLabels(): object[]
	{
		const geodata = this.props.geodata;
		if ((geodata == null) || (this.props.showLabels == false))
		{
			return [];
		}
		const projection = d3.geoMercator().fitSize([this.state.width, this.state.height],geodata.getFeatureCollection());
		const path = d3.geoPath().projection(projection);
		const indexedMap = R.addIndex(R.map);
		const labels = indexedMap( (feature, id: number): JSX.Element =>
		{
			const f = feature as Feature;
			const center = projection(d3.geoCentroid(f));
			let title = "";
			if (this.props.nameField == null)
			{
				const firstProp = R.head(R.keys(f.properties!));
				title = R.prop(firstProp!, f.properties!);
			}
			else
			{
				title = R.prop(this.props.nameField, f.properties!);
			}
			return (
				<g key={id}>
					<text x={(center == null) ? 0 : center["0"]} y={(center == null) ? 0 : center["1"]} dominantBaseline="middle" textAnchor="middle" style={{fontSize: "small"}} pointerEvents="none">
						{title}
					</text>
				</g>
			);
		}, geodata.getFeatures());
		return labels;
	}

	private getStyleFor(title: string, feature: Feature): object
	{
		if ( this.props.selectedLocation === title)
		{
			return {fill: "#cbf719", stroke: "#000000"};
		}
		else
		{
			if (!this.props.items)
			{
				return {fill: "#FFFFFF", stroke: "#000000"};
			}
			const vons = R.uniq(R.map((item) => item.Von, this.props.items));
			const field = R.length(vons) === 1 ? "Nach" : "Von";
			const itemForFeature = R.find((item) => item[field] === title, this.props.items);
			if (!itemForFeature)
			{
				return {fill: "#FFFFFF", stroke: "#000000"};
			}
			const value = parseInt(itemForFeature.Wert, 10);
			const colorProvider = this.pickColor;
			return {fill: colorProvider(value), stroke: "#000000"};
		}
	}

	private pickColor(value: number): string
	{
		if (value === 0)
		{
			return this.neutral_color;
		}
		else if (value > 0)
		{
			const [min, max] = this.getMinMax();
			const positive = d3.scaleQuantize<string>().domain([1, max]).range(this.colors);
			return positive(value);
		}
		else if (value < 0)
		{
			const [min, max] = this.getMinMax();
			const negative = d3.scaleQuantize<string>().domain([1, - min]).range(this.negative_colors);
			return negative(- value);
		}
		return this.neutral_color;
	}

	private getMinMax(): [number, number] {
		let max = 0;
		let min = 0;
		if (this.props.items)
		{
			let normalizedData = R.reject((item) => item.Von === item.Nach, this.props.items);
			max = R.reduce((acc, item) => R.max(acc, item.Wert), Number.MIN_VALUE, normalizedData);
			min = R.reduce((acc, item) => R.min(acc, item.Wert), Number.MAX_VALUE, normalizedData);
		}
		return [min, max];
	}
}