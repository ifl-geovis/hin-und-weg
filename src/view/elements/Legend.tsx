import { Polyline } from 'leaflet';
import React from 'react';

import Classification from '../../data/Classification';

export interface ILegendProps {
	showCenter: string;
}

export default class Legend extends React.Component<ILegendProps> {
	private stroke_color = '#4d4d4d';
	private box_size = 30;
	private label_offset = 5;

	constructor(props: ILegendProps) {
		super(props);
	}

	public render(): JSX.Element {
		return this.createLegend();
	}

	private createLegend(): JSX.Element {
		const classification = Classification.getCurrentClassification();
		let i = 0;
		const negative_scales = classification.getNegativeScales();
		const negative_colors = classification.getNegativeColors();
		const negative = this.createNegativeScale(negative_scales, negative_colors, i);
		if (negative_scales != null) i += negative_colors.length;
		const neutral = this.createNeutralBox(classification.getNeutralColor(), i * this.box_size + this.label_offset, 0);
		i++;
		const positive_scales = classification.getPositiveScales();
		const positive_colors = classification.getPositiveColors();
		const positive = this.createPositiveScale(positive_scales, positive_colors, i);
		if (positive_scales != null) i += positive_colors.length;
		// const selected = this.createSelectedBox(classification.getSelectedColor(), i*this.box_size+this.label_offset+40, 0);
		const arrows = this.createArrows(
			classification.getArrowWidths(),
			classification.getPositiveArrowColor(),
			classification.getNegativeArrowColor(),
			classification.getPositiveArrowWidthBounds(),
			classification.getNegativeArrowWidthBounds(),
			classification.getTheme() || ''
		);

		i++;
		return (
			<div>
				<h4>{this.createLegendTitle(classification)}</h4>
				<svg key="legend" width={i * this.box_size + 150} height={this.box_size + 21} style={{ display: 'block' }}>
					{' '}
					//20
					{negative}
					{neutral}
					{positive}
					{/* {selected} */}
				</svg>
				{this.props.showCenter === '2' && arrows}
			</div>
		);
	}

	private createArrows(
		arrowWidths: Array<number>,
		posArrowColor: string,
		negArrowColor: string,
		posArrowBounds: Array<number>,
		negArrowBounds: Array<number>,
		theme: string
	) {
		let arrows: Array<any> = [];
		let arrowOffset: number = 15;
		let labelOffset: number = 3;

		if (posArrowBounds[posArrowBounds.length - 1] || negArrowBounds[negArrowBounds.length - 1]) {
			switch (theme) {
				case 'Von':
					for (let index = 0; index < arrowWidths.length; index++) {
						arrows.push([
							<polyline
								key={`posArrow_${index}`}
								points={`0,${arrowOffset * index} 40,${arrowOffset * index}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={posArrowColor}
							/>,
							<text key={`posArrowLabel_${index}`} x="50" y={arrowOffset * index + labelOffset} style={{ font: '11px Open Sans' }}>
								{`≤ ${posArrowBounds[index].toFixed(0)}`}
							</text>,
						]);
					}
					break;
				case 'Nach':
					for (let index = 0; index < arrowWidths.length; index++) {
						arrows.push([
							<polyline
								key={`negArrow_${index}`}
								points={`0,${arrowOffset * index} 40,${arrowOffset * index}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={negArrowColor}
							/>,
							<text key={`negArrowLabel_${index}`} x="50" y={arrowOffset * index + labelOffset} style={{ font: '11px Open Sans' }}>
								{`≤ ${posArrowBounds[index].toFixed(0)}`}
							</text>,
						]);
					}
					break;
				case 'Saldi':
					for (let index = 0; index < arrowWidths.length; index++) {
						arrows.push([
							<polyline
								key={`posArrow_${index}`}
								points={`0,${arrowOffset * index} 40,${arrowOffset * index}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={negArrowColor}
							/>,
							<text key={`posArrowLabel_${index}`} x="50" y={arrowOffset * index + labelOffset} style={{ font: '11px Open Sans' }}>
								{`≤ ${posArrowBounds[index].toFixed(0)}`}
							</text>,
							<polyline
								key={`negArrow_${index}`}
								points={`130,${arrowOffset * index} 170,${arrowOffset * index}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={posArrowColor}
							/>,
							<text key={`negArrowLabel_${index}`} x="180" y={arrowOffset * index + labelOffset} style={{ font: '11px Open Sans' }}>
								{`≥ -${negArrowBounds[index].toFixed(0)}`}
							</text>,
						]);
					}
					break;
			}
		}

		return (
			<svg key="arrowLegend" style={{ paddingTop: '1em', marginTop: '1em' }} height={arrowOffset * arrowWidths.length + arrowOffset}>
				{arrows}
			</svg>
		);
	}

	private createLegendTitle(classification: Classification): string {
		let title = 'Legende';
		const location = classification.getLocation();
		const theme = classification.getTheme();
		if (location && theme) {
			title += ' für ';
			if (theme == 'Von') title += 'Wegzüge von ';
			else if (theme == 'Nach') title += 'Zuzüge nach ';
			else if (theme == 'Saldi') title += 'Saldi für ';
			title += location;
		}
		return title;
	}

	private createBox(color: string, x: number, y: number, index: string): object {
		return (
			<rect
				key={'box-' + color + '-' + index}
				fill={color}
				stroke={this.stroke_color}
				width={index === 'neutral' ? this.box_size * 0.5 : this.box_size}
				height={this.box_size}
				x={x}
				y={y}
			></rect>
		);
	}

	private createLine(color: string, key: string, x1: number, y1: number, x2: number, y2: number): object {
		return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />;
	}

	// Open Sans - font as in other elements
	private createLabel(label: string, x: number, y: number, index: string): object {
		return (
			<text key={'label-' + label + '-' + index} x={x} y={y} style={{ font: '11px Open Sans' }}>
				{/* { font: '10px sans-serif' } */}
				{label}
			</text>
		);
	}

	private createNeutralBox(color: string, x: number, y: number): object {
		const box = this.createBox(color, 0, 0, 'neutral');
		const line = this.createLine(this.stroke_color, 'neutral', this.box_size * 0.25, this.box_size, this.box_size * 0.25, this.box_size + 10);
		const label = this.createLabel('0', this.box_size * 0.25 - this.label_offset, this.box_size + 21, 'neutral');
		return (
			<svg x={x} y={y} width={this.box_size * 0.5} height={this.box_size + 21}>
				{box}
				{line}
				{label}
			</svg>
		);
	}

	private createPositiveScale(scales: number[] | null, colors: string[], index: number): object {
		if (scales == null) return <svg></svg>;
		let boxes = [];
		for (let i = 0; i < colors.length; i++) boxes.push(this.createBox(colors[i], i * this.box_size, 0, 'positive-' + i));
		let lines = [];
		let labels = [];
		for (let i = 0; i < scales.length; i++) {
			labels.push(this.createLabel('' + scales[i], (i + 1) * this.box_size - 3, this.box_size + 21, 'positive-' + i)); //  + 20
			lines.push(
				this.createLine(
					this.stroke_color,
					'positive-' + i,
					(i + 1) * this.box_size,
					this.box_size,
					(i + 1) * this.box_size,
					this.box_size + 10
				)
			);
		}
		return (
			// <svg x={index * this.box_size + this.label_offset} y={0}>
			<svg x={index * this.box_size - this.box_size * 0.5 + this.label_offset} y={0}>
				{boxes}
				{lines}
				{labels}
			</svg>
		);
	}

	private createNegativeScale(scales: number[] | null, colors: string[], index: number): object {
		if (scales == null) return <svg></svg>;
		let boxes = [];
		for (let i = 0; i < colors.length; i++)
			boxes.push(this.createBox(colors[colors.length - i - 1], i * this.box_size + this.label_offset, 0, 'negative-' + i));
		let lines = [];
		let labels = [];
		for (let i = 0; i < scales.length; i++) {
			labels.push(this.createLabel('' + scales[scales.length - i - 1], i * this.box_size, this.box_size + 20, 'negative-' + i));
			lines.push(
				this.createLine(
					this.stroke_color,
					'negative-' + i,
					i * this.box_size + this.label_offset,
					this.box_size,
					i * this.box_size + this.label_offset,
					this.box_size + 10
				)
			);
		}
		return (
			<svg x={index * this.box_size} y={0}>
				{boxes}
				{lines}
				{labels}
			</svg>
		);
	}
}
