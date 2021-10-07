import * as React from "react";
import {Slider} from "primereact/slider";
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';

import BaseData from '../../data/BaseData';



import * as d3 from 'd3';
import { select } from 'd3-selection';
import R from "ramda";
import Classification from '../../data/Classification';
import Legend from "../elements/Legend";

export interface ID3ChordItem
{
   Von: string;
   Nach: string;
   Wert: number;
  Absolutwert: number;
}

export interface ID3ChordProps {
   basedata: BaseData;
   data: ID3ChordItem[];
    theme: string;
    width: number;
    height: number;
    vizID: number;
    baseViewId: number;
   yearsSelected: string[];
   dataProcessing:string;
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
}

export class D3Chord extends React.Component <ID3ChordProps, ID3ChordState> {
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

    }
  }

    public componentDidMount() {
      this.svgID = this.setSvgId(this.props.vizID, this.props.baseViewId);
      const [min, max] = this.getMinMax2();
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");

      let data1 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) <= this.state.rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) >= min, this.props.data);
      let data2 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.rangeValues[1] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= max, this.props.data);
      let dataFilterSmall: ID3ChordItem[] = R.concat(data1, data2);
      let dataFilterLarge :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= this.state.rangeValues[1], this.props.data);
      let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;

      let normalizedData:ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= this.state.threshold, this.props.data);

      let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData

      if (data) {this.drawChordChart(data, this.props.theme, this.svgID) }

      }

    public shouldComponentUpdate (nextProps: ID3ChordProps, nextState: ID3ChordState) {

      return nextProps.data !== this.props.data || nextProps.theme !== this.props.theme|| nextState.checkedNoFilter !== this.state.checkedNoFilter || nextState.checkedLabel !== this.state.checkedLabel  || nextState.checked !== this.state.checked || nextProps.width !== this.props.width || nextProps.height !== this.props.height || nextState.threshold !==this.state.threshold || nextState.rangeValues !== this.state.rangeValues
      }

    public componentDidUpdate(){
        const [min, max] = this.getMinMax2();
        let threshold: number = this.state.checkedNoFilter ? min:  this.calculateCurrentThreshold();
        let rangeValues: [number, number] = this.state.checkedNoFilter ? [min, max]:  this.getInitialValuesSliderSaldi();
        let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");

        let data1 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) <= rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) >= min, this.props.data);
        let data2 :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= rangeValues[1] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= max, this.props.data);
        let dataFilterSmall: ID3ChordItem[] = R.concat(data1, data2);
        let dataFilterLarge :ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= rangeValues[0] && (wanderungsRate ? item.Wert*1000 :item.Wert) <= rangeValues[1], this.props.data);
        let dataSaldi = (this.state.checked === false) ? dataFilterLarge :dataFilterSmall ;
        let normalizedData:ID3ChordItem[] = R.filter((item) => (wanderungsRate ? item.Wert*1000 :item.Wert) >= threshold, this.props.data);
        let data =  (this.props.theme == "Saldi") ? dataSaldi : normalizedData

      this.removePreviousChart(this.svgID);
      this.drawChordChart(data, this.props.theme, this.svgID);
      }


      private setSvgId(vizId: number, BVId: number){
        let svgID = 'Chord' + vizId + BVId;
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

    // DRAW D3 CHART
    private drawChordChart (data: ID3ChordItem[], theme: string, id: string | undefined) {
      const [min, max] = this.getMinMax2();
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");



      this.checkedLabel = this.state.checkedLabel;
      const svgChord = select(this.svgRef!);
      let nach = data.map(d => d.Nach);
      let von = data.map(d => d.Von);
      let names = nach.concat(von);
      let maxNameLength = Math.max(...names.map(el => el ? el.length : 50));
      let marginResponsive = this.props.dataProcessing === "absolute" ? this.props.width < 500 ? this.state.checkedLabel === false ? maxNameLength*5.8 : (maxNameLength + 5)*5.8 :
      this.props.width < 700 && this.props.width >= 500 ? this.state.checkedLabel === false ? maxNameLength*6.3: (maxNameLength + 5)*6.3 :
      this.state.checkedLabel === false ? maxNameLength*7.4 : (maxNameLength + 5)*7.4 :
      this.state.checkedLabel === false ? maxNameLength*7.4 : (maxNameLength + 5)*7.4 ; // +10

      let MARGIN = {TOP: marginResponsive, RIGHT: marginResponsive, BOTTOM: marginResponsive, LEFT: marginResponsive}
      let WIDTH = this.props.width - MARGIN.LEFT - MARGIN.RIGHT;
      let HEIGHT = this.props.height - MARGIN.TOP - MARGIN.BOTTOM;

      const colorsBlue = ["#92c5de", "#2166ac"]
      const colorsRed = ["#b2182b", "#f4a582"]
      const colorsBlueRed = ["#2166ac","#b2182b","#d0d1e6"]
      const neutralcolor = "#f7f7f7"
      const bordercolor = "#525252"

      const classification = this.props.basedata.getClassification();
      // let hexcolor = classification.getColor(data[1]);

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


      svgChord.append("svg")
      .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
      .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)


      let chartChord = svgChord.append("g")
          .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)
          .attr("id", "circle")

      const outerRadius = Math.min(WIDTH, HEIGHT) / 2 - 15;
      const innerRadius = outerRadius - 24;

      if (outerRadius <= 0 || innerRadius <= 0){
        chartChord.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", ".35em")
        .attr("width", WIDTH)
        .text("Die Ansicht ist zu klein für dieses Diagramm. Bitte vergrößern Sie das Fenster.");
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

            //check index of the same name in names Von and Nach
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
        let indx = checkIndx(von, nach);
        let arr = Matrix(nach.length,nach.length,von, nach, 0);
        let valuesPlus :number[] = new Array(values.length + 1);
        valuesPlus.fill(0);
        let fillValuesPlus = () => {
          for(let i=0;i<values.length;i++){
              valuesPlus[i]=values[i]
            } return valuesPlus
          }

        valuesPlus = fillValuesPlus();

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

        // creates input matrix filled with values
        let matrixFull = (ar:any[][]) => {
          for(let j=0;j<ar[0].length;j++){
            for(let i=0;i<ar.length;i++){
              if (von[i] === nach[i] ){
                  ar[i] = values
                } else{
                  if (typeof(indx) === "number"){
                    ar[i][indx] = values[i]
                  }
                }
              }
            } return ar
          }

        let matrixFullPlus = (ar:any[][]) => {
          if(ar.length === values.length){
            for(let j=0;j<ar[0].length;j++)
            { for(let i=0;i<ar.length;i++)
              { if (von[i] === nach[i] ){
                  ar[i] = values
                 } else {
                   if (typeof(indx) === "number"){
                     ar[i][indx] = values[i]
                    }
                  }
               }
              }
            } else if (ar.length === valuesPlus.length ){
              for(let j=0;j<ar[0].length;j++) {
                for(let i=0;i<ar.length;i++){
                  if ( i === ar.length-1){
                    ar[i] =valuesPlus;
                  } else {
                    ar[i][ar.length-1] = valuesPlus[i];
                  }
                }
              }
            }return ar
          }

        //Set colors: darker/lighter for source/target
        let colorsFunction = (x:number, y:number, clrs:string[] )=> {
            let ac = new Array(y);
            ac.fill(clrs[0]);
            if (typeof(indx) === "number"){
              ac[indx] =clrs[1]
            } else if (!indx){
              ac[y-1] = clrs[1]
            } return ac
          }

        let colorsVon:string[] = colorsFunction(nach.length, arr.length, colorsBlue)
        let colorsNach:string[] = colorsFunction(von.length, arr.length, colorsRed)
        let hexcolorFull: string[] = arr.length === values.length ? hexcolor : hexcolorAdd;


        let chord = d3.chord()
          .padAngle(0.05)
          .sortSubgroups(d3.descending)
          .sortChords(d3.descending);

        let arc:any = d3.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius);

        let ribbon:any = d3.ribbon()
          .radius(innerRadius);

        if (theme === "Von")
        {
          //matrix used in Chord as an input
        // let arrFull =  matrixFull(arr);

          //matrix used in Chord when the inner flow for the selected area is filtered out
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
          // .style("stroke", function(d) { let col:any = d3.rgb(colorsBlue[0]); return col.darker(); })
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
            // .style("fill", function(d) { return colorsVon[d.index]; })
            .style("fill", function(d) { return hexcolorFull[d.index]; })
            .style("stroke", bordercolor)
            // .style("stroke", function(d) { let col:any = d3.rgb(colorsBlue[0]); return col.darker(); })
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
              + ": " + d.source.value
              if (vonVar[d.source.index] === nachVar[d.target.index]){
                t = vonVar[d.source.index]
                + " → " + nachVar[d.source.index]
                + ": " + d.source.value
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
            .style("font-size", this.props.width < 500 ? "10px" : this.props.width < 700 && this.props.width >= 500 ? "11px" : "13px" )
            .attr("font-family", "Open Sans")
            .attr("dx", function(d:any) { return labelText === 0 ? "" : dataProcessing ==="absolute" ?
            d.value < 100 ? d.angle > Math.PI ? "-1.9em" :  "1.9em" :
            d.value < 1000  && d.value >= 100 ? d.angle > Math.PI ? "-2.6em" :  "2.6em" :
            d.value < 10000  && d.value >= 1000 ? d.angle > Math.PI ? "-3.2em" :  "3.2em" :
            d.angle > Math.PI ? "-4em" : "4em" : wanderungsRate ?  d.angle > Math.PI ? "-4em" : "4em" :  d.angle > Math.PI ? "-4em" : "4em" ; }) // 1.2em
                        // .text(function(d, i) { return ((d.startAngle + d.endAngle) / 2) < Math.PI ? " : " + nachVar[i] : nachVar[i] + " : "; });
            .text(function(d, i) { return nachVar[i]; });
            // .text(function(d:any, i: number) { return d.angle > Math.PI ? nachVar[i] + '  ' + d.value : d.value + '  ' +  nachVar[i]; });

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
            .style("font-size", this.props.width < 500 ? "10px" : this.props.width < 700 && this.props.width >= 500 ? "10px" : "13px" )
            .attr("font-family", "Open Sans")
            .style("font-weight", "bold")
            .text(function(d:any, i: number) {  return labelText === 0 ? '' :d.angle > Math.PI  ?   " : " + Math.round((d.value + Number.EPSILON) * 1000) / 1000 : Math.round((d.value + Number.EPSILON) * 1000) / 1000+ " : " ; });

          group.append("title")
          group.select("title")
            .text(function(d, i){return vonVar[i];});


          svgChord.exit()
           .transition()
              .duration(1500)
              .attr("opacity", 0)
              .remove();

        }
        else if (theme === "Nach")
        {
         //matrixes used in Chord as an input
        // let arrFull =  matrixFull(arr);
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
          // .style("stroke", function(d) { let col:any = d3.rgb(colorsRed[1]); return col.darker(); })
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
        // .style("fill", function(d) { return colorsNach[d.index]; })
          .style("stroke", bordercolor)
          // .style("stroke", function(d) { let col:any = d3.rgb(colorsRed[1]); return col.darker(); })
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
            + ": " + d.target.value
            if (vonVar[d.source.index] === nachVar[d.target.index]){
              t = vonVar[d.target.index]
              + " → " + nachVar[d.source.index]
              + ": " + d.target.value
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
        .style("font-size", this.props.width < 500 ? "10px" : this.props.width < 700 && this.props.width >= 500 ? "11px" : "13px")
        .attr("font-family", "Open Sans")
        .attr("dx", function(d:any) { return labelText === 0 ? "" :  dataProcessing ==="absolute" ?
        d.value < 100 ? d.angle > Math.PI ? "-1.9em" :  "1.9em" :
        d.value < 1000  && d.value >= 100 ? d.angle > Math.PI ? "-2.6em" :  "2.6em" :
        d.value < 10000  && d.value >= 1000 ? d.angle > Math.PI ? "-3.2em" :  "3.2em" :d.angle > Math.PI ? "-4em" : "4em" :
        wanderungsRate ?  d.angle > Math.PI ? "-4em" : "4em" :  d.angle > Math.PI ? "-4em" : "4em" ; }) // 1.2em
                .text(function(d, i) { return vonVar[i]; });
        // .text(function(d, i) { return nachVar[i]; });
        // .text(function(d:any, i: number) { return d.angle > Math.PI ? nachVar[i] + '  ' + d.value : d.value + '  ' +  nachVar[i]; });

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
        .style("font-size", this.props.width < 500 ? "10px" : this.props.width < 700 && this.props.width >= 500 ? "10px" : "13px")
        .attr("font-family", "Open Sans")
        .style("font-weight", "bold")
        .text(function(d:any, i: number) {  return labelText === 0 ? '' :d.angle > Math.PI  ?   " : " + Math.round((d.value + Number.EPSILON) * 1000) / 1000 : Math.round((d.value + Number.EPSILON) * 1000) / 1000 + " : " ; });


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
        let valueasSaldiVarLabels = arr.length === values.length? values : valuesPlus;
        if(indx !== undefined){
          valueasSaldiVarLabels[indx] = valueasSaldiVarLabels.reduce((a, b) => a + b, 0)
        } else {
          valueasSaldiVarLabels[valueasSaldiVarLabels.length - 1] = valueasSaldiVarLabels.reduce((a, b) => a + b, 0)
        }
        let colorsSaldiFunctionNEW = (clrs:string[], ar:number[]) => {
          let ar2 = new Array(ar.length);
          ar2.fill(clrs[2]);
          let indx2 = (typeof(indx) === "number") ? indx : (ar2.length-1)
          for(let i=0;i<ar.length;i++){
            if (ar[i] < 0 ){
                ar2[i] = clrs[0]
              } else if (ar[i]>0){
                ar2[i] = clrs[1]
              } else if (ar[i] === 0 || i == indx2){
                ar2[i] = clrs[2]
              }
            } return ar2
          }

        let colorsSaldi = colorsSaldiFunctionNEW(colorsBlueRed, valueasSaldiVar);

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
          // .style("stroke", function(d) { let col:any = d3.rgb(colorsBlueRed[2]); return col.darker(); })
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
        // .style("fill", function(d) { return colorsSaldi ? colorsSaldi[d.index] : colorsVon[d.index]; })
          .style("stroke", bordercolor)
          // .style("stroke", function(d) { let col:any = d3.rgb(colorsBlueRed[2]); return col.darker(); })
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
            + ": " + valueasSaldiVar[d.source.index]
            if (vonVar[d.source.index] === nachVar[d.target.index]){
              t = vonVar[d.target.index]
              + " → " + nachVar[d.source.index]
              + ": " + (valueasSaldiVar[d.source.index] === 0 ? valueasSaldiVar[d.target.index]:valueasSaldiVar[d.source.index])
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
        .style("font-size", this.props.width < 500 ? "10px" : this.props.width < 700 && this.props.width >= 500 ? "11px" :  "13px" )
        .attr("font-family", "Open Sans")
        .attr("dx", function(d:any) { return labelText === 0 ? "" : dataProcessing === "absolute" ?
        d.value < 100 ? d.angle > Math.PI ? "-1.9em" :  "1.9em" :
        d.value < 1000  && d.value >= 100 ? d.angle > Math.PI ? "-2.6em" :  "2.6em" :
        d.value < 10000  && d.value >= 1000 ? d.angle > Math.PI ? "-3.2em" :  "3.2em" :
        d.angle > Math.PI ? "-4em" : "4em" :
        wanderungsRate ?  d.angle > Math.PI ? "-4em" : "4em" :  d.angle > Math.PI ? "-4em" : "4em" ; }) // 1.2em
                .text(function(d, i) { return vonVar[i]; });
        // .text(function(d, i) { return nachVar[i]; });
        // .text(function(d:any, i: number) { return d.angle > Math.PI ? nachVar[i] + '  ' + d.value : d.value + '  ' +  nachVar[i]; });

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
        .style("font-size", this.props.width < 500 ? "10px" : this.props.width < 700 && this.props.width >= 500 ? "10px" : "13px")
        .attr("font-family", "Open Sans")
        .style("font-weight", "bold")
        .text(function(d:any, i: number) {  return labelText === 0 ? '' :d.angle > Math.PI  ?   " : " + Math.round((valueasSaldiVarLabels[d.index]  + Number.EPSILON) * 1000) / 1000  : Math.round((valueasSaldiVarLabels[d.index]  + Number.EPSILON) * 1000) / 1000  + " : " ; });

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
        let [min, max] = this.getMinMax2();
       

        let threshold: number = this.state.checkedNoFilter ? min : this.calculateCurrentThreshold();
        let rangeValues: [number, number] = this.state.checkedNoFilter ? [min, max] : this.getInitialValuesSliderSaldi();
                // let saldiText: string = (this.state.checked === true)? ('ab ' + min + ' bis: ' + rangeValues[0] + '       und          ab: ' + rangeValues[1] + ' bis: ' + max) : ('ab ' + rangeValues[0] + ' bis: ' + rangeValues[1]);
        let rangeValue1: number = this.state.checkedNoFilter ? min : rangeValues[0];
        let rangeValue2: number = this.state.checkedNoFilter ? max : rangeValues[1];
      let wanderungsRate: boolean = (this.props.dataProcessing === "wanderungsrate") || (this.props.dataProcessing === "ratevon") || (this.props.dataProcessing === "ratenach");

        return (
        <div className="p-grid">

          <div className="p-col-6 noprint">
            <Checkbox
              name = "saldiChord"
              id	= "saldiChord"
              onChange={(e: { value: any, checked: boolean }) => this.setState({checked: e.checked})}
              checked={this.state.checked}
              disabled= {(this.props.theme === 'Saldi') ? false : true}
            />
            <label className="p-checkbox-label">Umgekehrt filtern</label>
          </div>
          <div className="p-col-6 noprint">
            <Checkbox
              name = "saldiChordNoFilter"
              id	= "saldiChordNoFilter"
              onChange={(e: { value: any, checked: boolean }) => this.setState({checkedNoFilter: e.checked})}
              checked={this.state.checkedNoFilter}
            />
            <label className="p-checkbox-label">Kein Filter</label>
          </div>

          <div className="p-col-1 noprint" style={{ width: '3.5em' }}>{wanderungsRate ? min/1000 : min}</div>
            <div className="p-col-10 noprint">
            <div className={`banner ${ this.props.theme == "Saldi" ? this.state.checked === true ?  "slider-reversed" : "slider-saldi" : ""}`}>

                {
                    this.props.theme == "Saldi" ?
                    <Slider disabled={this.state.checkedNoFilter ? true : false} min={min} max={max} value={this.state.checkedNoFilter ? [min, max] :rangeValues } onChange={(e) => this.state.checkedNoFilter ? this.setState({rangeValues: [min, max  ]as [number, number]}) : this.setState({rangeValues: e.value as [number, number]})} range={true}  />
                    :
                    <Slider disabled={this.state.checkedNoFilter ? true : false} min={min} max={max} value={this.state.checkedNoFilter ? min : threshold} orientation="horizontal" onChange={(e) => this.state.checkedNoFilter ? this.setState({  threshold: min as number}) : this.setState({  threshold: e.value as number}) }/>
                }
          </div>
          </div>
            <div className="p-col-1 noprint" style={{ width: '3.5em' }}>{wanderungsRate ? max/1000 : max}</div>
              {/* <div className="p-col-12 p-justify-center">{this.props.theme == "Saldi" ? 'Anzeige Werte in Bereich: ' + saldiText : 'Anzeige ab Wert: ' + threshold  }</div> */}
              <div className="p-col-2 noprint">{this.props.theme == "Saldi" ?  this.state.checked === true?
          'Anzeige Werte in Bereich: ab ' + wanderungsRate ? min/1000 : min + ' bis ' :
          'Anzeige Werte in Bereich: ab ' : 'Anzeige ab Wert: '}
            </div>
            <div className="p-col-2 noprint">{this.props.theme == "Saldi" ?
             <InputText value={wanderungsRate ? rangeValue1/1000 : rangeValue1 } style={{ width: '6em' }} type='number' onChange={(e:any) => this.state.checkedNoFilter ? this.setState({rangeValues: [min as number, rangeValue2]}) :  this.setState({ rangeValues: [e.target.value as number, rangeValue2] })} />
             : <InputText value={ this.state.checkedNoFilter ? wanderungsRate ? min/1000 : min: wanderungsRate ? threshold/1000 : threshold} style={{ width: '10em' }} type='number' onChange={(e:any) => this.state.checkedNoFilter ? this.setState({ threshold: min as number }) : this.setState({ threshold: e.target.value as number })} />
            }
             </div>
             <div className="p-col-2 noprint">{this.props.theme == "Saldi" ? this.state.checked === true?
            'und ab ' : 'bis ' : ' '} </div>
            <div className="p-col-2 noprint"> {this.props.theme == "Saldi" ?
             <InputText  value={wanderungsRate ? rangeValue2/1000 : rangeValue2} style={{ width: '6em' }} type='number' onChange={(e:any) => this.state.checkedNoFilter ? this.setState({ rangeValues: [rangeValue1, max as number] }) : this.setState({ rangeValues: [rangeValue1, e.target.value as number] })} /> : <div className="p-col-2 p-offset-1"></div>}
             </div>
             <div className="p-col-2">{this.props.theme == "Saldi" && this.state.checked === true?
            'bis ' + wanderungsRate ? max/1000 : max : ' '} </div>
            <div className="p-col-12 p-md-12 p-lg-6">
               <Legend basedata={this.props.basedata} showCenter='' yearsSelected={this.props.yearsSelected} />
            </div>
        <div className="p-col-12 p-md-12 p-lg-6 noprint">
          <Checkbox id = "values" name = "values"
            onChange={(e: { value: any, checked: boolean }) => this.setState({checkedLabel: e.checked})}
            checked={this.state.checkedLabel}
          />
          <label className="p-checkbox-label" style={{ font: '14px Open Sans' }}>Anzahl Umzüge anzeigen</label>
        </div>
          <div className="p-col-12" >
                <svg id={this.svgID} width={width} height={height} ref={ref => (this.svgRef = ref)} />
          </div>
           </div>
        );
      }


}

