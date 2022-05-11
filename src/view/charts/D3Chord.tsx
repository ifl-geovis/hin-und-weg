import BaseData from "../../data/BaseData";
import * as React from "react";
import {Slider} from "primereact/slider";
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from "primereact/radiobutton";
import { Accordion, AccordionTab } from 'primereact/accordion';
import * as d3 from 'd3';
import { select } from 'd3-selection';
import R from "ramda";
import Classification from '../../data/Classification';
import Legend from "../elements/Legend";
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
// import { TFunction } from "i18next";
import { InputNumber } from 'primereact/inputnumber';


export interface ID3ChordItem
{
  Von: string;
  Nach: string;
  Wert: number;
  Absolutwert: number;
}

export interface ID3ChordProps extends WithNamespaces{
  basedata: BaseData;
  data: ID3ChordItem[];
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
interface ID3ChordState
{
  threshold: number;
  rangeValue1: number;
  rangeValue2: number;
  rangeValues: [number, number],
  checked: boolean,
  checkedLabel: boolean,
  checkedNoFilter: boolean,
  sort: string;
  chartWidth: number;
	checkedNaN: boolean;
}

// export 
class D3Chord extends React.Component <ID3ChordProps, ID3ChordState> {
    private svgRef?: SVGElement | null;
    private svgID?: string;
    private checkedLabel?: boolean;



    constructor(props: ID3ChordProps)
   {
      super(props);
    this.state = {
      threshold: 0,
      rangeValue1: 0,
      rangeValue2: 0,
      rangeValues: [0, 0],
      checked: false,
      checkedLabel: false,
      checkedNoFilter: false,
      sort: "alphabetical",
			chartWidth: this.props.width,
			checkedNaN: false
    }
		this.sortData = this.sortData.bind(this);
  }

    public componentDidMount() {
      this.svgID = this.setSvgId(this.props.vizID, this.props.baseViewId);
      const [min, max] = this.getMinMax2();
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");

      let data1: ID3ChordItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[0] && (wanderungsRate? item.Wert/1000 : item.Wert) >= min , this.props.data) : R.filter((item) => Number.isNaN((wanderungsRate? item.Wert/1000 : item.Wert)) || (wanderungsRate? item.Wert/1000 : item.Wert) <= this.state.rangeValues[0] && (wanderungsRate? item.Wert/1000 : item.Wert) >= min , this.props.data);
      // let data1 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) <= this.state.rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) >= min, this.props.data);
      let data2 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.rangeValues[1] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= max, this.props.data);
      let dataFilterSmall: ID3ChordItem[] = R.concat(data1, data2);
      let dataFilterLarge: ID3ChordItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[1],this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[1] || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
      // let dataFilterLarge :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= this.state.rangeValues[1], this.props.data);
      let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;

      let normalizedData:ID3ChordItem[] = this.state.checkedNaN ?  R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.threshold, this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.threshold || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
      // let normalizedData:ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.threshold, this.props.data);

      let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData
      this.sortData(data) 
      if (data) {this.drawChordChart(data, this.props.theme, this.svgID) }

      }

    public shouldComponentUpdate (nextProps: ID3ChordProps, nextState: ID3ChordState) {

      return nextProps.data !== this.props.data || 
      nextProps.basedata.getMigrationsInside() !== this.props.basedata.getMigrationsInside() || 
      nextProps.basedata !== this.props.basedata ||
      nextProps.theme !== this.props.theme|| 
      nextState.checkedNoFilter !== this.state.checkedNoFilter || 
      nextState.checkedLabel !== this.state.checkedLabel  || 
      nextState.checked !== this.state.checked || 
      nextState.checkedNaN !== this.state.checkedNaN || 
      nextProps.width !== this.props.width || 
      nextProps.height !== this.props.height || 
      nextState.threshold !==this.state.threshold || 
      nextState.rangeValues !== this.state.rangeValues || 
      nextProps.dataProcessing !== this.props.dataProcessing ||
      nextState.sort !== this.state.sort ||
			nextProps.yearsSelected !== this.props.yearsSelected ||
			nextProps.positive_scales !== this.props.positive_scales ||
			nextProps.negative_scales !== this.props.negative_scales ||
			nextProps.positive_colors !== this.props.positive_colors ||
      nextProps.negative_colors !== this.props.negative_colors ||
      nextState.chartWidth !== this.state.chartWidth
      }

      public componentDidUpdate(nextProps: ID3ChordProps, nextState: ID3ChordState){
        const [min, max] = this.getMinMax2();
        let threshold: number = this.state.checkedNoFilter ? min:  this.calculateCurrentThreshold();
        let rangeValues: [number, number] = this.state.checkedNoFilter ? [min, max]:  this.getInitialValuesSliderSaldi();
        if(nextProps.dataProcessing !== this.props.dataProcessing || nextProps.theme !== this.props.theme){
          rangeValues = [min, max];
          this.setState({ rangeValues: [min, max]});
          threshold = min;
          this.setState({threshold: min});
       }
        let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
        let data1: ID3ChordItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[0] && (wanderungsRate? item.Wert/1000 : item.Wert) >= min , this.props.data) : R.filter((item) => Number.isNaN((wanderungsRate? item.Wert/1000 : item.Wert)) || (wanderungsRate? item.Wert/1000 : item.Wert) <= this.state.rangeValues[0] && (wanderungsRate? item.Wert/1000 : item.Wert) >= min , this.props.data);
        // let data1 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) <= rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) >= min, this.props.data);
        let data2 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= rangeValues[1] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= max, this.props.data);
        let dataFilterSmall: ID3ChordItem[] = R.concat(data1, data2);
        let dataFilterLarge: ID3ChordItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[1],this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.rangeValues[0] && (wanderungsRate? item.Wert*1000 : item.Wert) <= this.state.rangeValues[1] || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
        // let dataFilterLarge :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= rangeValues[1], this.props.data);
        let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;
        let normalizedData: ID3ChordItem[] = this.state.checkedNaN ? R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.threshold , this.props.data) : R.filter((item) => (wanderungsRate? item.Wert*1000 : item.Wert) >= this.state.threshold || Number.isNaN((wanderungsRate? item.Wert*1000 : item.Wert)), this.props.data);
        // let normalizedData:ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= threshold, this.props.data);
        let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData
        this.sortData(data) 
      this.removePreviousChart(this.svgID);
      this.drawChordChart(data, this.props.theme, this.svgID);
      }


      //creates unique svg id for each updated vesrion of the visualisation
      private setSvgId(vizId: number, BVId: number){
        let svgID = 'Chord' + vizId + BVId;
        return svgID;
      }

      //removes previous version of the chart
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

    // DRAW D3 CHART
    private drawChordChart (data: ID3ChordItem[], theme: string, id: string | undefined) {
      const {t}:any = this.props ;
      let smallViewtext1 = t('charts.smallView1');
      let smallViewtext2 = t('charts.smallView2');
      let smallViewtext3 = t('charts.smallView3');
      const noNaN = this.state.checkedNaN;

      const migrationInside = this.props.basedata.getMigrationsInside();
      const [min, max] = this.getMinMax2();
      const ascending = this.state.sort === "ascending";
      // const descending = this.state.sort === "descending";
      // const alphabetical = this.state.sort === "alphabetical";
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");

      this.checkedLabel = this.state.checkedLabel;
      const svgChord = select(this.svgRef!);
      let nach = data.map(d => d.Nach);
      let von = data.map(d => d.Von);
      let names = nach.concat(von);
      let maxNameLength = Math.max(...names.map(el => el ? el.length : 50));
      let marginResponsive = this.props.dataProcessing === "absolute" ? this.state.chartWidth < 500  ? this.state.checkedLabel === false ? maxNameLength*5.8 : (maxNameLength + 5)*5.8 :
      this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? this.state.checkedLabel === false ? maxNameLength*6.3: (maxNameLength + 5)*6.3 :
      this.state.checkedLabel === false ? maxNameLength*7.4 : (maxNameLength + 5)*7.4 :
      this.state.checkedLabel === false ? maxNameLength*7.4 : (maxNameLength + 5)*7.4 ; // +10

      let MARGIN = {TOP: marginResponsive, RIGHT: marginResponsive, BOTTOM: marginResponsive, LEFT: marginResponsive}
		  let WIDTH = this.state.chartWidth > this.props.width ? this.props.width - MARGIN.LEFT - MARGIN.RIGHT : this.state.chartWidth - MARGIN.LEFT - MARGIN.RIGHT;
      let HEIGHT = WIDTH + MARGIN.LEFT + MARGIN.RIGHT - MARGIN.TOP - MARGIN.BOTTOM;
     
      const classification = this.props.basedata.getClassification();
      const nancolor = classification.getMissingColor()
      const bordercolor = "#525252"

      let classColors = (data: ID3ChordItem[]) => {
        let colors = new Array(data.length);
          colors.fill('#000000');
        for(let i=0;i<data.length;i++)
        {
          colors[i]=classification.getColor(data[i])
        }  return colors
      }
      let hexcolor:string[]  = classColors(data);

      let hexcolorAdd: string[] =  classColors(data);
        hexcolorAdd.push("#f7f7f7");
        
      const standardizeOutput = (value: number): string =>
        {
          if ((Number.isInteger(value)) || (value == null) || (!Number.isFinite(value))) return "" + value;
          if (i18n.language == "en") return value.toFixed(3).replace(",", ".");
          return value.toFixed(3).replace("\.", ",");
        }
     

      svgChord.append("svg")
      .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
      .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)


      let chartChord = svgChord.append("g")
          .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
          .attr("id", "circle")

      let smallViewText = svgChord.append("g")
          .attr("transform", `translate(${MARGIN.LEFT/4}, ${MARGIN.TOP/4})`)
          .attr("id", "smallViewText")

      const outerRadius = Math.min(WIDTH, HEIGHT) / 2 - 15;
      const innerRadius = outerRadius - 24;
      const smallView: boolean = outerRadius <= 0 || innerRadius <= 0; 

      if (smallView){
        smallViewText.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "0em") //.35em
        .attr("width", WIDTH)
        .style("font-size", "12px")
        .text(smallViewtext1);
        smallViewText.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "1.2em")
        .attr("width", WIDTH)
        .style("font-size", "12px")
        .text(smallViewtext2);
        smallViewText.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "2.4em")
        .attr("width", WIDTH)
        .style("font-size", "12px")
        .text(smallViewtext3);
      } else {
      // creates input matrix with 0 values
        function Matrix(r:any, c:any, v:any[], n:any[], value:number) {
          if (!value) value = 0;
          let x:number = (indx === undefined? r+1 : r);
          let y:number = (indx === undefined? c+1 : c);
          let arr = new Array(y);
          arr.fill(value);
          return arr.map(row);
          function row() {
            let subArr = new Array(x);
            subArr.fill(value);
            return subArr;
           }
          }

            //check index of the same name in names Von and Nach (selected Bezugsfläche)
        let checkIndx = (ar1:string[], ar2:string[]) => { let n:number; for(let i=0;i<ar1.length;i++)
            {
              if (ar1[i] === ar2[i] ){
                n=i;
                return n
              }
            }
          }

        let nach = data.map(d => d.Nach);
        let von = data.map(d => d.Von);
        let values =data.map(d=> +d.Wert);
        let valuesZero =data.map(d=> !d.Wert ? 0 : +d.Wert);
        let indx = checkIndx(von, nach);
        let arr = Matrix(nach.length,nach.length,von, nach, 0);
        let valuesPlus :number[] = new Array(values.length + 1);
        valuesPlus.fill(0);
        let fillValuesPlus = () => {
          for(let i=0;i<values.length;i++){
              valuesPlus[i]=values[i]
            } return valuesPlus
          }
          let valuesZeroPlus :number[] = new Array(valuesZero.length + 1);
          valuesZeroPlus.fill(0);
            let fillValuesZeroPlus = () => {
              for(let i=0;i<valuesZero.length;i++){
                valuesZeroPlus[i]=valuesZero[i]
                } return valuesZeroPlus
              }
       
              valuesPlus = fillValuesPlus();
        valuesZeroPlus = fillValuesZeroPlus();

        let nachPlus :string[] = new Array(nach.length + 1);
        nachPlus.fill(theme === "Nach" || "Saldi" ? nach[0]:von[0]);
        let fillNachPlus = () => {
          for(let i=0;i<nach.length;i++){
              nachPlus[i]=nach[i]
            }
            if (indx === undefined){
              nachPlus[nachPlus.length - 1] = von[0]
            }
            return nachPlus
          }
        nachPlus = fillNachPlus();

        let vonPlus :string[] = new Array(von.length + 1);
        vonPlus.fill(theme === "Von"? von[0]:nach[0]);
          let fillVonPlus = () => {
            for(let i=0;i<von.length;i++){
            vonPlus[i]=von[i]
            } return vonPlus
          }
        vonPlus = fillVonPlus();

        let nachVar = arr.length === nach.length? nach : nachPlus;
        let vonVar = arr.length === von.length? von : vonPlus;

        let matrixFullPlus = (ar:any[][]) => {
          if(ar.length === valuesZero.length){
            for(let j=0;j<ar[0].length;j++)
            { for(let i=0;i<ar.length;i++)
              { if (von[i] === nach[i] ){
                  ar[i] = valuesZero
                 } else {
                   if (typeof(indx) === "number"){
                     ar[i][indx] = valuesZero[i]
                    }
                  }
               }
              }
            } else if (ar.length === valuesZeroPlus.length ){
              for(let j=0;j<ar[0].length;j++) {
                for(let i=0;i<ar.length;i++){
                  if ( i === ar.length-1){
                    ar[i] =valuesZeroPlus;
                  } else {
                    ar[i][ar.length-1] = valuesZeroPlus[i];
                  }
                }
              }
            }return ar
          }


        let hexcolorFull: string[] = arr.length === values.length ? hexcolor : hexcolorAdd;


        let chord = d3.chord()
          .padAngle(0.05)
          .sortSubgroups(d3.descending)
          .sortChords(ascending ? d3.ascending : d3.descending);
          // .sortChords(d3.descending);

        let arc:any = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);

        let ribbon:any = d3.ribbon()
          .radius(innerRadius);

        if (theme === "Von")
        {
          //matrix used in Chord as an input
        let arrFullPlus = matrixFullPlus(arr);

        let g = chartChord.append("g")
          .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
          .datum(chord(arrFullPlus));

        // creating the fill gradient
        //Create a gradient definition for each chord
        let grads = g.append("defs").selectAll("linearGradient")
        .data(function(chords) { return chords})
        .enter().append("linearGradient")
        //Create a unique gradient id per chord
        .attr("id", function(d) {
            return "chordGradient" + id  + "-" + d.source.index + "-" + d.target.index;
        })
        //Instead of the object bounding box, use the entire SVG for setting locations
        //in pixel locations instead of percentages (which is more typical)
        .attr("gradientUnits", "userSpaceOnUse")
        //The full mathematical formula to find the x and y locations
        //of the Avenger's source chord
        .attr("x1", function(d,i) {
            return innerRadius*Math.cos((d.source.endAngle-d.source.startAngle)/2 +
            d.source.startAngle-Math.PI/2);
        })
        .attr("y1", function(d,i) {
            return innerRadius*Math.sin((d.source.endAngle-d.source.startAngle)/2 +
            d.source.startAngle-Math.PI/2);
        })
        //Find the location of the target Avenger's chord
        .attr("x2", function(d,i) {
            return innerRadius*Math.cos((d.target.endAngle-d.target.startAngle)/2 +
            d.target.startAngle-Math.PI/2);
        })
        .attr("y2", function(d,i) {
            return innerRadius*Math.sin((d.target.endAngle-d.target.startAngle)/2 +
            d.target.startAngle-Math.PI/2);
        })
        // Set the starting color (at 0%)
        grads.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(d){ return hexcolorFull[d.source.index]; });
            // .attr("stop-color", function(d){ return colorsVon[d.source.index]; });

        //Set the ending color (at 100%)
        grads.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function(d){ return hexcolorFull[d.target.index]; });
            // .attr("stop-color", function(d){ return colorsVon[d.target.index]; });

        let group = g.append("g")
          .attr("class", "groups")
          .selectAll("g")
          .data(function(chords) { return chords.groups; })
          .enter().append("g");

        let ribbons=  g.append("g")
          .attr("class", "ribbons")
          .selectAll("path")
          .data(function(chords) { return chords; })
          .enter().append("path")
          .attr("d", ribbon)
          .style("fill", function(d){ return "url(#chordGradient" + id  + "-" + d.source.index + "-" + d.target.index + ")";})
          .style("stroke", bordercolor)
          .on("mouseover", function(d) {
            ribbons
              .filter(dd => dd !== d)
              .transition()
              .style('opacity', 0.1);
                  // fade other groups
            groupPath
              .filter((dd,i) => dd.index !== d.source.index && dd.index !== d.target.index)
              .transition()
              .style("opacity", 0.1);
            })
            .on("mouseout", function(d) {
              ribbons
                .transition()
                .style('opacity', 1);
                  // unfade groups
              groupPath
                .transition()
                .style("opacity", 1);
              });


          const groupPath = group.append("path")
            .style("fill", function(d) { return hexcolorFull[d.index]; })
            .style("stroke", bordercolor)
            .attr("d", arc)
            .on("mouseover",  function(d, i) {
                ribbons
                  .filter(function(d) {
                      return d.source.index != i && d.target.index != i;
                    })
                  .transition()
                  .style("opacity", 0.1)
                groupPath
                  .filter(function(dd) { return dd.index != d.index; })
                  .transition()
                  .style("opacity", 0.1)
              })
            .on("mouseout", function(d, i) {
              ribbons
                .filter(function(d) {
                    return d.source.index != i && d.target.index != i;
                  })
                .transition()
                .style("opacity", 1)
              groupPath
                .filter(function(dd) { return dd.index != d.index; })
                .transition()
                .style("opacity", 1)
               });
  

          // mouseover title for each chord.
          ribbons.append("title")
          ribbons.select("title")
            .text(function(d, i) {
              let t:string
              t = vonVar[d.source.index]
              + " → " + nachVar[d.target.index]
              + ": " + standardizeOutput(migrationInside ? values[d.source.index] : valuesPlus[d.source.index])
              if (indx !== undefined && migrationInside ){
                t = vonVar[d.source.index]
                + " → " + nachVar[d.target.index]
                + ": " + standardizeOutput(migrationInside ? values[d.target.index] : valuesPlus[d.target.index])
              } else
               if (indx !== undefined && isNaN(values[indx])){
                t = vonVar[d.source.index]
                + " → " + nachVar[d.target.index]
                + ": " + standardizeOutput(migrationInside ? values[d.target.index] : valuesPlus[d.target.index])
              } else if (vonVar[d.target.index] === nachVar[d.target.index]){
                t = vonVar[d.source.index]
                + " → " + nachVar[d.source.index]
                + ": " + standardizeOutput(migrationInside ? values[d.source.index] : valuesPlus[d.source.index])
              }
              return t
           })

           let labelText:number = this.state.checkedLabel === false ? 0 :  1 ;
           let dataProcessing = this.props.dataProcessing;

          //Append the label names on the outside
          const labels = group.append("text")
            .each(function(d:any) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("class", "titles")
            .attr("text-anchor", function(d:any) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d:any) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
              + "translate(" + (outerRadius + 10) + ")"
              + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("font-size", this.state.chartWidth < 500 ? "10px" : this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? "11px" : "13px" )
            .attr("font-family", "Open Sans")
            .attr("dx", function(d:any, i:number) { return labelText === 0 ? "" : dataProcessing ==="absolute" ?
            !values[i]  ? d.angle >Math.PI ? "-4.3em" :  "4.3em" : //3.2
            d.value < 100 ? d.angle > Math.PI ? "-1.9em" :  "1.9em" :
            d.value < 1000  && d.value >= 100 ? d.angle > Math.PI ? "-2.6em" :  "2.6em" :
            d.value < 10000  && d.value >= 1000 ? d.angle > Math.PI ? "-3.2em" :  "3.2em" :
            d.value < 10000000  && d.value >= 100000 ? d.angle > Math.PI ? "-4.3em" :  "4.3em" :
            d.angle > Math.PI ? "-4.3em" : "4.3em" : wanderungsRate ?  d.angle > Math.PI ? "-4em" : "4em" :  d.angle > Math.PI ? "-4em" : "4em" ; }) // 1.2em
            .text(function(d, i) { return nachVar[i]; });

          const labelsValues = group.append("text")
            .each(function(d:any) { d.angle = (d.startAngle + d.endAngle) / 2; })
            .attr("dy", ".35em")
            .attr("class", "titles")
            .attr("text-anchor", function(d:any) { return d.angle > Math.PI ? "end" : null; })
            .attr("transform", function(d:any) {
              return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
              + "translate(" + (outerRadius + 10) + ")"
              + (d.angle > Math.PI ? "rotate(180)" : "");
            })
            .style("font-size", this.state.chartWidth < 500 ? "10px" : this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? "10px" : "13px" )
            .attr("font-family", "Open Sans")
            .style("font-weight", "bold")
            .text(function(d:any, i: number) {  return labelText === 0 ? '' :d.angle > Math.PI  ?   " : " + standardizeOutput(Math.round((migrationInside ? (d.value!== 0 ? d.value + Number.EPSILON : values[i] + Number.EPSILON) : (d.value!== 0 ? d.value + Number.EPSILON : valuesPlus[i] + Number.EPSILON)) * 1000) / 1000) : standardizeOutput(Math.round((migrationInside ? (d.value!== 0 ? d.value + Number.EPSILON : values[i] + Number.EPSILON) : (d.value!== 0 ? d.value + Number.EPSILON : valuesPlus[i] + Number.EPSILON)) * 1000) / 1000)+ " : " ; });

          group.append("title")
          group.select("title")
          .text(function(d, i){return nachVar[i];});


          svgChord.exit()
           .transition()
              .duration(1500)
              .attr("opacity", 0)
              .remove();

        }
        else if (theme === "Nach")
        {
         //matrixes used in Chord as an input
        let arrFullPlus  = matrixFullPlus(arr);
        let g = chartChord.append("g")
          .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
          .datum(chord(arrFullPlus));

        // creating the fill gradient
        //Create a gradient definition for each chord
        let grads = g.append("defs").selectAll("linearGradient")
        .data(function(chords) { return chords})
        .enter().append("linearGradient")
        //Create a unique gradient id per chord
        .attr("id", function(d) {
            return "chordGradient" + id  + "-" + d.source.index + "-" + d.target.index;
        })
        //Instead of the object bounding box, use the entire SVG for setting locations
        //in pixel locations instead of percentages (which is more typical)
        .attr("gradientUnits", "userSpaceOnUse")
        //The full mathematical formula to find the x and y locations
        //of the Avenger's source chord
        .attr("x1", function(d,i) {
            return innerRadius*Math.cos((d.source.endAngle-d.source.startAngle)/2 +
            d.source.startAngle-Math.PI/2);
        })
        .attr("y1", function(d,i) {
            return innerRadius*Math.sin((d.source.endAngle-d.source.startAngle)/2 +
            d.source.startAngle-Math.PI/2);
        })
        //Find the location of the target Avenger's chord
        .attr("x2", function(d,i) {
            return innerRadius*Math.cos((d.target.endAngle-d.target.startAngle)/2 +
            d.target.startAngle-Math.PI/2);
        })
        .attr("y2", function(d,i) {
            return innerRadius*Math.sin((d.target.endAngle-d.target.startAngle)/2 +
            d.target.startAngle-Math.PI/2);
        })

        // Set the starting color (at 0%)
        grads.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(d){ return hexcolorFull[d.source.index]; });
            // .attr("stop-color", function(d){ return colorsNach[d.source.index]; });

        //Set the ending color (at 100%)
        grads.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function(d){ return hexcolorFull[d.target.index]; });
            // .attr("stop-color", function(d){ return colorsNach[d.target.index]; });

        let group = g.append("g")
          .attr("class", "groups")
          .selectAll("g")
          .data(function(chords) { return chords.groups; })
          .enter().append("g");

        let ribbons=  g.append("g")
          .attr("class", "ribbons")
          .selectAll("path")
          .data(function(chords) { return chords; })
          .enter().append("path")
          .attr("d", ribbon)
          .style("fill", function(d){ return "url(#chordGradient" + id  + "-" + d.source.index + "-" + d.target.index + ")";})
          .style("stroke", bordercolor)
          .on("mouseover", function(d) {
              ribbons
                .filter(dd => dd !== d)
                .transition()
                .style('opacity', 0.1);
              // fade other groups
              groupPath
                .filter((dd,i) => dd.index !== d.source.index && dd.index !== d.target.index)
                .transition()
                .style("opacity", 0.1);
             })
          .on("mouseout", function(d) {
              ribbons
                .transition()
                .style('opacity', 1);
              // unfade groups
              groupPath
                .transition()
                .style("opacity", 1);
           });

        const groupPath = group.append("path")
        .style("fill", function(d) { return hexcolorFull[d.index]; })
          .style("stroke", bordercolor)
          .attr("d", arc)
          .on("mouseover",  function(d, i) {
              ribbons.filter(function(d) {
                    return d.source.index != i && d.target.index != i;
                  })
                    .transition()
                    .style("opacity", 0.1)
              groupPath
                  .filter(function(dd) { return dd.index != d.index; })
                  .transition()
                    .style("opacity", 0.1)
            })
          .on("mouseout", function(d, i) {
            ribbons.filter(function(d) {
                  return d.source.index != i && d.target.index != i;
                })
                  .transition()
                    .style("opacity", 1)
            groupPath
                  .filter(function(dd) { return dd.index != d.index; })
                  .transition()
                    .style("opacity", 1)
            });


            // mouseover title for each chord.
        ribbons.append("title")
        ribbons.select("title")
          .text(function(d, i) {
            let t:string
            t = vonVar[d.source.index]
            + " → " + nachVar[d.source.index]
            + ": " + standardizeOutput(migrationInside ? values[d.target.index] : valuesPlus[d.target.index])
            if (indx !== undefined && isNaN(values[indx]) && migrationInside){
              t = vonVar[d.target.index]
              + " → " + nachVar[d.target.index]
              + ": " + standardizeOutput(migrationInside ? values[d.target.index] : valuesPlus[d.target.index])
            } else  if ((indx === undefined  ) ){
                t = vonVar[d.source.index]
              + " → " + nachVar[d.source.index]
              + ": " + standardizeOutput(migrationInside ? values[d.source.index] : valuesPlus[d.source.index])
            } else if (vonVar[d.source.index] === nachVar[d.source.index]){
              t = vonVar[d.target.index]
              + " → " + nachVar[d.source.index]
              + ": " + standardizeOutput(migrationInside ? values[d.target.index] : valuesPlus[d.target.index])
            }
            return t
          })

          let labelText:number = this.state.checkedLabel === false ? 0 :  1 ;
          let dataProcessing : string = this.props.dataProcessing;
        //Append the label names on the outside
        const labels = group.append("text")
        .each(function(d:any) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "titles")
        .attr("text-anchor", function(d:any) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d:any) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (outerRadius + 10) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("font-size", this.state.chartWidth < 500 ? "10px" : this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? "11px" : "13px")
        .attr("font-family", "Open Sans")
        .attr("dx", function(d:any, i:number) { return labelText === 0 ? "" :  dataProcessing ==="absolute" ?
        !values[i]  ? d.angle >Math.PI ? "-4.3em" :  "4.3em" : //3.2
        d.value < 100 ? d.angle > Math.PI ? "-1.9em" :  "1.9em" :
        d.value < 1000  && d.value >= 100 ? d.angle > Math.PI ? "-2.6em" :  "2.6em" :
        d.value < 10000  && d.value >= 1000 ? d.angle > Math.PI ? "-3.2em" :  "3.2em" :
        d.value < 10000000  && d.value >= 100000 ? d.angle > Math.PI ? "-4.3em" :  "4.3em" :
        d.angle > Math.PI ? "-4.3em" : "4.3em" :
        wanderungsRate ?  d.angle > Math.PI ? "-4em" : "4em" :  d.angle > Math.PI ? "-4em" : "4em" ; }) // 1.2em
        .text(function(d, i) { return vonVar[i]; });

      const labelsValues = group.append("text")
        .each(function(d:any) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "titles")
        .attr("text-anchor", function(d:any) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d:any) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (outerRadius + 10) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("font-size", this.state.chartWidth < 500 ? "10px" : this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? "10px" : "13px")
        .attr("font-family", "Open Sans")
        .style("font-weight", "bold")
        .text(function(d:any, i: number) {  return labelText === 0 ? '' :d.angle > Math.PI  ?   " : " + standardizeOutput(Math.round((migrationInside ?  (d.value!== 0 ? d.value + Number.EPSILON : values[i] + Number.EPSILON) : (d.value!== 0 ? d.value + Number.EPSILON : valuesPlus[i] + Number.EPSILON)) * 1000) / 1000) : standardizeOutput(Math.round((migrationInside ?  (d.value!== 0 ? d.value + Number.EPSILON : values[i] + Number.EPSILON) : (d.value!== 0 ? d.value + Number.EPSILON : valuesPlus[i] + Number.EPSILON)) * 1000) / 1000) + " : " ; });


          group.append("title")
          group.select("title")
           .text(function(d, i){return vonVar[i];});


        svgChord.exit()
          .transition()
            .duration(1500)
            .attr("opacity", 0)
            .remove();

        }
        else if (theme == "Saldi") {

        let values =data.map(d=> +d.Wert);
        let valuesPlus :number[] = new Array(values.length + 1);
        valuesPlus.fill(0);
        let fillValuesPlus = () => {
          for(let i=0;i<values.length;i++){
            valuesPlus[i]=values[i]
          } return valuesPlus
        }

        valuesPlus = fillValuesPlus();

        let valuesZero =data.map(d=> !d.Wert ? 0 : +d.Wert);
        let valuesZeroPlus :number[] = new Array(valuesZero.length + 1);
        valuesZeroPlus.fill(0);
        let fillValuesZeroPlus = () => {
          for(let i=0;i<valuesZero.length;i++){
            valuesZeroPlus[i]=valuesZero[i]
          } return valuesZeroPlus
        }
        valuesZeroPlus = fillValuesZeroPlus();
       
        //matrix used in Chord as an input
        let arrFull =  matrixFullPlus(arr);

        let arrAbsolute = (ar:any[][]) => {
          for(let j=0;j<ar[0].length;j++) {
            for(let i=0;i<ar.length;i++) {
              if (ar[i][j] < 0 ){
                ar[i][j] = Math.abs(ar[i][j])
              }
            }
          } return ar
        }
        let arrSaldi = arrAbsolute(arrFull)

        let valueasSaldiVar = arr.length === values.length? values : valuesPlus;
        let valueasSaldiVarZero = arr.length === valuesZero.length? valuesZero : valuesZeroPlus;
        // create sum label for the selected Bezugsfläche
        let valueasSaldiVarLabels = arr.length === values.length? values : valuesPlus;
        let valueasSaldiVarZeroLabels = arr.length === valuesZero.length? valuesZero : valuesZeroPlus;
        if(indx !== undefined){
          valueasSaldiVarLabels[indx] = valueasSaldiVarZeroLabels.reduce((a, b) =>  a + b, 0)
        } else {
          valueasSaldiVarLabels[valueasSaldiVarLabels.length - 1] = valueasSaldiVarZeroLabels.reduce((a, b) =>  a + b, 0)
        }
    

        let g = chartChord.append("g")
          .attr("transform", "translate(" + WIDTH / 2 + "," + HEIGHT / 2 + ")")
          .datum(chord(arrSaldi));

        // creating the fill gradient
        //Create a gradient definition for each chord
        let grads = g.append("defs").selectAll("linearGradient")
        .data(function(chords) { return chords})
        .enter().append("linearGradient")
        //Create a unique gradient id per chord
        .attr("id", function(d) {
            return "chordGradient" + id  + "-" + d.source.index + "-" + d.target.index;
        })
        //Instead of the object bounding box, use the entire SVG for setting locations
        //in pixel locations instead of percentages (which is more typical)
        .attr("gradientUnits", "userSpaceOnUse")
        //The full mathematical formula to find the x and y locations
        //of the Avenger's source chord
        .attr("x1", function(d,i) {
            return innerRadius*Math.cos((d.source.endAngle-d.source.startAngle)/2 +
            d.source.startAngle-Math.PI/2);
        })
        .attr("y1", function(d,i) {
            return innerRadius*Math.sin((d.source.endAngle-d.source.startAngle)/2 +
            d.source.startAngle-Math.PI/2);
        })
        //Find the location of the target Avenger's chord
        .attr("x2", function(d,i) {
            return innerRadius*Math.cos((d.target.endAngle-d.target.startAngle)/2 +
            d.target.startAngle-Math.PI/2);
        })
        .attr("y2", function(d,i) {
            return innerRadius*Math.sin((d.target.endAngle-d.target.startAngle)/2 +
            d.target.startAngle-Math.PI/2);
        })
        // Set the starting color (at 0%)
        grads.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", function(d){ return hexcolorFull[d.source.index] });
            // .attr("stop-color", function(d){ return colorsSaldi ? colorsSaldi[d.source.index] : colorsVon[d.source.index]; });
        //Set the ending color (at 100%)
        grads.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", function(d){ return  hexcolorFull[d.target.index] });
            // .attr("stop-color", function(d){ return colorsSaldi ? colorsSaldi[d.target.index] : colorsVon[d.target.index]; });

        let group = g.append("g")
          .attr("class", "groups")
          .selectAll("g")
          .data(function(chords) { return chords.groups; })
          .enter().append("g");

        let ribbons=  g.append("g")
          .attr("class", "ribbons")
          .selectAll("path")
          .data(function(chords) { return chords; })
          .enter().append("path")
          .attr("d", ribbon)
          .style("fill", function(d){ return "url(#chordGradient" + id  + "-" + d.source.index + "-" + d.target.index + ")";})
          .style("stroke", bordercolor)
          .on("mouseover", function(d) {
            ribbons
              .filter(dd => dd !== d)
              .transition()
                .style('opacity', 0.1);
                  // fade other groups
            groupPath
              .filter((dd,i) => dd.index !== d.source.index && dd.index !== d.target.index)
              .transition()
                .style("opacity", 0.1);
              })
            .on("mouseout", function(d) {
              ribbons
                .transition()
                  .style('opacity', 1);
                  // unfade groups
              groupPath
                .transition()
                  .style("opacity", 1);
              });


        const groupPath = group.append("path")
        .style("fill", function(d) { return  hexcolorFull[d.index] })
          .style("stroke", bordercolor)
          .attr("d", arc)
          .on("mouseover",  function(d, i) {
              ribbons.filter(function(d) {
                    return d.source.index != i && d.target.index != i;
                  })
                    .transition()
                    .style("opacity", 0.1)
              groupPath
                  .filter(function(dd) { return dd.index != d.index; })
                  .transition()
                    .style("opacity", 0.1)
            })
          .on("mouseout", function(d, i) {
            ribbons.filter(function(d) {
                  return d.source.index != i && d.target.index != i;
                })
                  .transition()
                    .style("opacity", 1)
            groupPath
                  .filter(function(dd) { return dd.index != d.index; })
                  .transition()
                    .style("opacity", 1)
                });

        ribbons.append("title")

        ribbons.select("title")
          .text(function(d, i) {
            let t:string
            t = vonVar[d.source.index]
            + " → " + nachVar[d.source.index]
            + ": " + standardizeOutput(valueasSaldiVar[d.source.index])
            if (vonVar[d.source.index] === nachVar[d.source.index]){
              t = vonVar[d.target.index]
              + " → " + nachVar[d.source.index]
              + ": " + standardizeOutput(valueasSaldiVar[d.target.index])
            } return t
          })
          let labelText:number = this.state.checkedLabel === false ? 0 :  1 ;
          let dataProcessing :string = this.props.dataProcessing;


        //Append the label names on the outside
        const labels = group.append("text")
        .each(function(d:any) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "titles")
        .attr("text-anchor", function(d:any) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d:any) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (outerRadius + 10) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("font-size", this.state.chartWidth < 500 ? "10px" : this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? "11px" :  "13px" )
        .attr("font-family", "Open Sans")
        .attr("dx", function(d:any, i:number) { return labelText === 0 ? "" : dataProcessing === "absolute" ?
        !values[i]  ? d.angle >Math.PI ? "-4.3em" :  "4.3em" : //3.2
        d.value < 100 ? d.angle > Math.PI ? "-1.9em" :  "1.9em" :
        d.value < 1000  && d.value >= 100 ? d.angle > Math.PI ? "-2.6em" :  "2.6em" :
        d.value < 10000  && d.value >= 1000 ? d.angle > Math.PI ? "-3.2em" :  "3.2em" :
        d.value < 10000000  && d.value >= 100000 ? d.angle > Math.PI ? "-4.3em" :  "4.3em" :
        d.angle > Math.PI ? "-4.3em" : "4.3em" :
        wanderungsRate ?  d.angle > Math.PI ? "-4em" : "4em" :  d.angle > Math.PI ? "-4em" : "4em" ; }) // 1.2em
        .text(function(d, i) { return vonVar[i]; });

      const labelsValues = group.append("text")
        .each(function(d:any) { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("class", "titles")
        .attr("text-anchor", function(d:any) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d:any) {
          return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
          + "translate(" + (outerRadius + 10) + ")"
          + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("font-size", this.state.chartWidth < 500 ? "10px" : this.state.chartWidth < 700 && this.state.chartWidth >= 500 ? "10px" : "13px")
        .attr("font-family", "Open Sans")
        .style("font-weight", "bold")
        .text(function(d:any, i: number) {  return labelText === 0 ? '' :d.angle > Math.PI  ?   " : " + standardizeOutput(Math.round(( valueasSaldiVarLabels[d.index]  + Number.EPSILON) * 1000) / 1000)  : standardizeOutput(Math.round(( valueasSaldiVarLabels[d.index]  + Number.EPSILON) * 1000) / 1000)  + " : " ; });

        group.append("title")
        group.select("title")
          .text(function(d, i){return vonVar[i];});

        svgChord.exit()
        .transition()
            .duration(1500)
            .attr("opacity", 0)
            .remove();
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


    // private getMinMax(): [number, number]
    // {
    //   let max = Number.MIN_VALUE;
    //   let second_max = Number.MIN_VALUE;
    //   let min = Number.MAX_VALUE;
    //   if (this.props.data)
    //   {
    //     for (let item of this.props.data)
    //     {
    //       if (item["Wert"] < min)
    //       {
    //         min = item["Wert"];
    //       }
    //       if (item["Wert"] > max)
    //       {
    //         if (max > second_max)
    //         {
    //           second_max = max;
    //         }
    //         max = item["Wert"];
    //       }
    //       else if (item["Wert"] > second_max)
    //       {
    //         second_max = item["Wert"];
    //       }
    //     }
    //   }
    //   return [min, second_max + 1];
    //   }

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
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
      min = Math.round((min + Number.EPSILON) * 1000) / 1000;
      max = Math.round((max + Number.EPSILON) * 1000) / 1000;
      min = wanderungsRate ? min * 1000 : min;
      max = wanderungsRate ? max * 1000 : max;
      return [min, max + 1];
    }

    private getInitialValuesSliderSaldi(): [number, number]
    {
      let [min, max] = this.getMinMax2();
      max = max - 1;
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

    private sortData(data: ID3ChordItem[]): any[] {
      let ascending: boolean = this.state.sort === "ascending";
      // let descending: boolean = this.state.sort === "descending";
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
      // if(descending){data.sort((data1: any, data2: any) => {
      //   let result; 
      //   if(isFinite(data2.Wert - data1.Wert)) {
      //      result = data2.Wert - data1.Wert;
      //     } else {
      //     isFinite(data1.Wert) ? result = -1 : result = 1;
      //     }
      //   return (result); 
      // });}
      if(alphabetical){data.sort((data1: any, data2: any) => {
        let dataField1 = this.props.theme ==="Von" ? data1.Nach : data1.Von;
        let dataField2 = this.props.theme ==="Von" ? data2.Nach : data2.Von;
        let result = dataField1 - dataField2;
        return (result); 
      });}
      return data;
    }

    private calculateCurrentThresholdWidth(): number {
      let [min, max] = [this.props.width/2, this.props.width];
      // min = Math.round((min + Number.EPSILON) * 1000) / 1000;
      // max = Math.round((max + Number.EPSILON) * 1000) / 1000;
      let chartWidth: number = this.state.chartWidth;
      if (this.state.chartWidth == 0) chartWidth = min;
      if (this.state.chartWidth < min) chartWidth = min;
      if (this.state.chartWidth > max) chartWidth = max;
      return chartWidth;
    }
    private standardizeOutput(value: number): string
	{
		if ((Number.isInteger(value)) || (value == null) || (!Number.isFinite(value))) return "" + value;
		if (i18n.language == "en") return value.toFixed(3).replace(",", ".");
		return value.toFixed(3).replace("\.", ",");
	}

    public render() {
		  const {t}:any = this.props ;
      const { width, height } = this.props;
      let [min, max] = this.getMinMax2();
      max = max-1;

      let threshold: number = this.state.checkedNoFilter ? min : this.calculateCurrentThreshold();
      let rangeValues: [number, number] = this.state.checkedNoFilter ? [min, max] : this.getInitialValuesSliderSaldi();
      let rangeValue1: number = this.state.checkedNoFilter ? min : rangeValues[0];
      let rangeValue2: number = this.state.checkedNoFilter ? max : rangeValues[1];
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");
      let chartWidth: number = this.calculateCurrentThresholdWidth();
      // const english = i18n.language == "en";
	  	// const german = i18n.language == "de";
      return (
      <div className="p-grid">
        <Accordion activeIndex={0}>
					<AccordionTab header={t('geodataView.controlElements')}>
						<div className="p-grid p-component">
              <div className="p-col-2 noprint rdBtnContainer">
								{t('charts.scaleWidth')}
							</div>
							<div className="p-col-10 noprint">
								<div className={`banner  ''}`}>
									{
										<Slider
											// disabled={this.state.checkedNoFilter   ? true : false}
											min={width/2}
											max={width}
											value={chartWidth}
											orientation="horizontal"
											onChange={(e) => this.setState({  chartWidth: e.value as number })}
										/>
									}
								</div>
							</div>

              <div className="p-col-2 noprint rdBtnContainer">
								{t('charts.dataFilter')}
							</div>
              <div className="p-col-1 noprint rdBtnContainer" style={{ width: '3.5em' }}>{wanderungsRate ? this.standardizeOutput(min/1000) : this.standardizeOutput(min)}</div>
              <div className="p-col-8 noprint">
                <div className={`banner ${ this.props.theme == "Saldi" ? this.state.checked === true ?  "slider-reversed" : "slider-saldi" : ""}`}>
                  {
                    this.props.theme == "Saldi" ?
                    <Slider disabled={this.state.checkedNoFilter ? true : false} min={min} max={max} value={this.state.checkedNoFilter ? [min, max] :rangeValues } onChange={(e) => this.state.checkedNoFilter ? this.setState({rangeValues: [min, max  ]as [number, number]}) : this.setState({rangeValues: e.value as [number, number]})} range={true}  />
                    :
                    <Slider disabled={this.state.checkedNoFilter ? true : false} min={min} max={max} value={this.state.checkedNoFilter ? min : threshold} orientation="horizontal" onChange={(e) => this.state.checkedNoFilter ? this.setState({  threshold: min as number}) : this.setState({  threshold: e.value as number}) }/>
                  }
                </div>
              </div>
              <div className="p-col-1 noprint rdBtnContainer" style={{ width: '3.5em' }}>{wanderungsRate ? this.standardizeOutput(max/1000) : this.standardizeOutput(max)}</div>
              
              
              
              {/* <div className="p-col-12 p-justify-center">{this.props.theme == "Saldi" ? 'Anzeige Werte in Bereich: ' + saldiText : 'Anzeige ab Wert: ' + threshold  }</div> */}
              <div className="p-col-2 noprint rdBtnContainer">
                {this.props.theme == "Saldi" ?  this.state.checked === true?
                t('charts.sliderSaldi1') + (wanderungsRate ? this.standardizeOutput(min/1000) : min) + t('charts.sliderSaldi2') :
                // 'Anzeige Werte in Bereich: ab ' + (wanderungsRate ? min/1000 : min) + ' bis ' :
                t('charts.sliderSaldi1') : t('charts.slider')}
                {/* 'Anzeige Werte in Bereich: ab ' : 'Anzeige ab Wert: '} */}
              </div>
            <div className="p-col-2 noprint">
              {this.props.theme == "Saldi" ? wanderungsRate ? 
				// english? 
				// 	<InputNumber inputId="locale-us" 
				// 		value={rangeValue1/1000} 
				// 		onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [min as number, rangeValue2]}) : this.setState({ rangeValues: [e.target.value < min/1000 ? min : e.target.value as number, rangeValue2] })} 
				// 		mode="decimal" 
				// 		//  min={min }
				// 		step={0.001}
				// 		max={max}
				// 		locale="en-US" 
				// 		minFractionDigits={3}/> : 
				// 	<InputNumber 
				// 		inputId="locale-german" 
				// 		value={rangeValue1/1000} 
				// 		onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [min as number, rangeValue2]}) : this.setState({ rangeValues: [e.target.value < min/1000 ? min : e.target.value  as number, rangeValue2] })}
				// 		//  min={min }
				// 		step={0.001}
				// 		max={max}
				// 		mode="decimal" 
				// 		locale="de-DE" 
				// 		minFractionDigits={3}/> 
						<div> {this.state.checkedNoFilter ? (wanderungsRate ? this.standardizeOutput(min/1000 ): min)  : (wanderungsRate ? this.standardizeOutput(rangeValue1/1000) : rangeValue1) } </div>

					: 
					<InputNumber
						useGrouping={false} 
						value={rangeValue1} 
						onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [min as number, rangeValue2]}) : this.setState({ rangeValues: [e.target.value as number, rangeValue2] })} />
					: wanderungsRate ? 
					//  english ? 
					//  <InputNumber inputId="locale-us" 
					// 	value={this.state.checkedNoFilter ? min/1000 : threshold/1000} 
					// 	onChange={(e:any) => this.state.checkedNoFilter ? this.setState({ threshold:  min as number }) : this.setState({ threshold: e.target.value < min/1000 ? min : e.target.value*1000 as number })}
					// 	//  min={min }
					// 	step={0.001}
					// 	max={max}
					// 	showButtons
					// 	mode="decimal" 
					// 	locale="en-US" 
					// 	minFractionDigits={3}/> : 
					// <InputNumber 
					// 	inputId="locale-german" 
					// 	value={this.state.checkedNoFilter ? min/1000 : threshold/1000} 
					// 	onChange={(e:any) => this.state.checkedNoFilter ? this.setState({ threshold:  min as number }) : this.setState({ threshold: e.target.value < min/1000 ? min : e.target.value*1000 as number })}
					// 	showButtons
					// 	step={0.001}
					// 	//  min={min}
					// 	max={max}
					// 	mode="decimal" 
					// 	locale="de-DE" 
					// 	minFractionDigits={3}/> 
					<div> {this.state.checkedNoFilter ? (wanderungsRate ? this.standardizeOutput(min/1000) : min) : (wanderungsRate ? this.standardizeOutput(threshold/1000) : threshold)} </div>
					: 
					<InputNumber
						 useGrouping={false} 
						 value={this.state.checkedNoFilter ? min : threshold} 
						 showButtons
						//  min={min} 
						 max={max}
						 onChange={(e:any) => this.state.checkedNoFilter ? this.setState({ threshold:  min as number }) : this.setState({ threshold: e.target.value < min ? min :  e.target.value  as number })}/>         
              }
            </div>
            <div className="p-col-2 noprint rdBtnContainer">{this.props.theme == "Saldi" ? this.state.checked === true?
              t('charts.sliderSaldi3') : t('charts.sliderSaldi2') : ' '} 
            </div>
              {/* 'und ab ' : 'bis ' : ' '} </div> */}
            <div className="p-col-3 noprint"> {this.props.theme == "Saldi" ?
            wanderungsRate ? 
            // english? 
            // <InputNumber inputId="locale-us" 
            // 	value={rangeValue2/1000} 
            // 	onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [rangeValue1 , max as number]}) : this.setState({ rangeValues: [rangeValue1, e.target.value > max/1000 ? max : e.target.value as number ] })} 
            // 	mode="decimal" 
            // 	//  min={min }
            // 	step={0.001}
            // 	max={max}
            // 	showButtons
            // 	locale="en-US" 
            // 	minFractionDigits={3}/> : 
            // <InputNumber 
            // 	inputId="locale-german" 
            // 	value={rangeValue2/1000} 
            // 	onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [rangeValue1 , rangeValue2 as number]}) : this.setState({ rangeValues: [rangeValue1, e.target.value > max/1000 ? max : e.target.value as number ] })} 
            // 	//  min={min }
            // 	step={0.001}
            // 	max={max}
            // 	mode="decimal" 
            // 	showButtons
            // 	locale="de-DE" 
            // 	minFractionDigits={3}/> 
            <div> {this.state.checkedNoFilter ? (wanderungsRate? this.standardizeOutput(max/1000) : max) : (wanderungsRate ? this.standardizeOutput(rangeValue2/1000) : rangeValue2)} </div>
            : 
            <InputNumber 
              useGrouping={false} 
              showButtons
              value={rangeValue2} 
              onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [rangeValue1, max as number]}) : this.setState({ rangeValues: [rangeValue1, e.target.value > max ? max : e.target.value as number ] })} />
             :
              <div className="p-col-3 p-offset-1"></div>}
            </div>
            <div className="p-col-2">{this.props.theme == "Saldi" ? this.state.checked === true?
						t('charts.sliderSaldi2') + (wanderungsRate ? this.standardizeOutput(max/1000) : max) : ' ' : ' '} </div>

            <div className="p-col-1 noprint"> </div>

            <div className="p-grid p-col-3 p-dir-col">		
            {/* <div className="p-col-6 noprint"> */}
					    <div className="p-col rdBtnContainer">
                <Checkbox
                  name = "saldiChord"
                  id	= "saldiChord"
                  onChange={(e: { value: any, checked: boolean }) => this.setState({checked: e.checked})}
                  checked={this.state.checked}
                  disabled= {(this.props.theme === 'Saldi') ? false : true}
                />
                <label className="p-checkbox-label">{t('charts.reverse')}</label>
                {/* <label className="p-checkbox-label">Umgekehrt filtern</label> */}
              </div>
          {/* <div className="p-col-6 noprint"> */}
					    <div className="p-col rdBtnContainer">
                <Checkbox
                  name = "saldiChordNoFilter"
                  id	= "saldiChordNoFilter"
                  onChange={(e: { value: any, checked: boolean }) => this.setState({checkedNoFilter: e.checked})}
                  checked={this.state.checkedNoFilter}
                />
                <label className="p-checkbox-label">{t('charts.nofilter')}</label>
              </div>
              <div className="p-col rdBtnContainer">
              {/* <div className="p-col-4 noprint"> */}
                <Checkbox
                  name = "noNaN"
                  id	= "noNaN"
                  onChange={(e: { value: any, checked: boolean }) => this.setState({checkedNaN: e.checked})}
                  checked={this.state.checkedNaN}
                />
                <label className="p-checkbox-label">{t('charts.noNaN')}</label>
              </div>
					    <div className="p-col rdBtnContainer">
              {/* <div className="p-col-12 p-md-12 p-lg-3 noprint"> */}
                <Checkbox id = "values" name = "values"
                  onChange={(e: { value: any, checked: boolean }) => this.setState({checkedLabel: e.checked})}
                  checked={this.state.checkedLabel}
                />
              <label className="p-checkbox-label">{t('charts.values')}</label>
              {/* <label className="p-checkbox-label" style={{ font: '14px Open Sans' }}>Werte anzeigen</label> */}
              </div>
            </div>

            <div className="p-grid p-col-3  p-dir-col">		
				      <div className="p-col rdBtnContainer">
				 	      {t('charts.sort')}
				      </div>
				      <div className="p-col rdBtnContainer">
              {/* <div className="p-col-4 noprint">  */}
              <RadioButton inputId='s1' value='alphabetical' name='sortChord' onChange={(e: { value: string, checked: boolean }) => this.setState({sort: e.value})}  checked={this.state.sort === 'alphabetical'}  />  <label className="p-checkbox-label">{t('charts.alphabetical')}</label> </div>
				      <div className="p-col rdBtnContainer">
              {/* <div className="p-col-4 noprint">  */}
              <RadioButton inputId='s2' value='ascending' name='sortChord' onChange={(e: { value: string, checked: boolean }) => this.setState({sort: e.value})} checked={this.state.sort === 'ascending'} /> <label className="p-checkbox-label">{t('charts.ascending')}</label>  </div>
				      {/* <div className="p-col rdBtnContainer"> */}
              {/* <div className="p-col-4 noprint">  */}
              {/* <RadioButton inputId='s3' value='descending' name='sortChord' onChange={(e: { value: string, checked: boolean }) => this.setState({sort: e.value})} checked={this.state.sort === 'descending'} /> <label className="p-checkbox-label">{t('charts.descending')}</label> </div> */}
            </div>
          </div>
        </AccordionTab>
			</Accordion>
      <div className="p-col-12 p-md-12 p-lg-9">
        <Legend noNaN={this.state.checkedNaN} basedata={this.props.basedata} showCenter='' yearsSelected={this.props.yearsSelected} />
      </div>
      <div className="p-col-12" >
        <svg id={this.svgID} width={width === NaN ? this.props.width : width} height={height} ref={ref => (this.svgRef = ref)} />
      </div>
    </div>
    );
  }


}
export default withNamespaces()(D3Chord);

