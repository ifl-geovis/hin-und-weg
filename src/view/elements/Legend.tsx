import React from "react";

import Classification from "../../data/Classification";

export interface ILegendProps
{
}

export default class Legend extends React.Component<ILegendProps>
{

  private stroke_color = '#4d4d4d';
  private box_size = 24;

  constructor(props: ILegendProps)
  {
    super(props);
  }

  public render(): JSX.Element
  {
    return this.createLegend();
  }

  private createLegend(): JSX.Element
  {
    const classification = Classification.getCurrentClassification();
    let i = 0;
    const negative_scales = classification.getNegativeScales();
    const negative_colors = classification.getNegativeColors();
    const negative = this.createNegativeScale(negative_scales, negative_colors, i);
    if (negative_scales != null) i += negative_colors.length;
    const neutral = this.createNeutralBox(classification.getNeutralColor(), i*this.box_size, 0);
    i++;
    const positive_scales = classification.getPositiveScales();
    const positive_colors = classification.getPositiveColors();
    const positive = this.createPositiveScale(positive_scales, positive_colors, i);
    if (positive_scales != null) i += positive_colors.length;
    const selected = this.createSelectedBox(classification.getSelectedColor(), i*this.box_size+40, 0);
    i++;
    return (
      <svg width={i*this.box_size+150} height={this.box_size+20}>
        {negative}
        {neutral}
        {positive}
        {selected}
      </svg>
    );
  }

  private createBox(color: string, x: number, y: number): object
  {
    return (<rect fill={color} stroke={this.stroke_color} width={this.box_size} height={this.box_size} x={x} y={y}></rect>);
  }

  private createLine(color: string, x1: number, y1: number, x2: number, y2: number): object
  {
    return (<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />);
  }

  private createLabel(label: string, x: number, y: number): object
  {
    return (<text x={x} y={y} style={{font: "10px sans-serif"}}>{label}</text>);
  }

  private createSelectedBox(color: string, x: number, y: number): object
  {
    const box = this.createBox(color, 100, 0);
    return (<svg x={x} y={y}><text x={0} y={18}>Bezugsfläche:</text>{box}</svg>);
  }

  private createNeutralBox(color: string, x: number, y: number): object
  {
    const box = this.createBox(color, 0, 0);
    return (<svg x={x} y={y}><text x={7} y={this.box_size+18}>0</text>{box}</svg>);
  }

  private createPositiveScale(scales: number[]|null, colors: string[] , index: number): object
  {
    if (scales == null) return (<svg></svg>);
    let boxes = [];
    for (let i = 0; i < colors.length; i++) boxes.push(this.createBox(colors[i], i*this.box_size, 0));
    let lines = [];
    let labels = [];
    for (let i = 0; i < scales.length; i++)
    {
      labels.push(this.createLabel(""+scales[i], (i+1)*this.box_size-3, this.box_size+20));
      lines.push(this.createLine(this.stroke_color, (i+1)*this.box_size, this.box_size, (i+1)*this.box_size, this.box_size+10));
    }
    return (<svg x={index*this.box_size} y={0}>{boxes}{lines}{labels}</svg>);
  }

  private createNegativeScale(scales: number[]|null, colors: string[] , index: number): object
  {
    if (scales == null) return (<svg></svg>);
    let boxes = [];
    for (let i = 0; i < colors.length; i++) boxes.push(this.createBox(colors[colors.length-i-1], i*this.box_size, 0));
    let lines = [];
    let labels = [];
    for (let i = 0; i < scales.length; i++)
    {
      labels.push(this.createLabel(""+scales[scales.length-i-1], (i+1)*this.box_size-5, this.box_size+20));
      lines.push(this.createLine(this.stroke_color, (i+1)*this.box_size, this.box_size, (i+1)*this.box_size, this.box_size+10));
    }
    return (<svg x={index*this.box_size} y={0}>{boxes}{lines}{labels}</svg>);
  }

}