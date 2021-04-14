import { Polyline } from 'leaflet';
import React from 'react';

import Log from '../../log';
import Classification from '../../data/Classification';

export interface ILegendProps {
	showCenter: string;
	yearsSelected: string[];
}

export default class Legend extends React.Component<ILegendProps> {
	private stroke_color = '#4d4d4d';
	private box_width = 50;
	private box_height = 20;
	private label_char_width = 6;
	private label_offset = 5 * this.label_char_width;

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
		const positive_scales = classification.getPositiveScales();
		const positive_colors = classification.getPositiveColors();
		const positive = this.createPositiveScale(positive_scales, positive_colors, (i > 0) ? i * this.box_width + this.label_offset : 0);
		if (positive_scales != null) i += positive_colors.length;
		const neutral = this.createNeutralBox(classification.hasZeroValues(), classification.getNeutralColor(), this.label_offset, 6);
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
				<svg key="legend" width={i * this.box_width + 3 * this.label_offset} height={this.box_height + 22} style={{ display: 'block' }}>
					{' '}
					{negative}
					{positive}
				</svg>
				{neutral}
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
								points={`0,${arrowOffset * (index + 1)} 40,${arrowOffset * (index + 1)}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={posArrowColor}
							/>,
							<text
								key={`posArrowLabel_${index}`}
								x="50"
								y={arrowOffset * (index + 1) + labelOffset}
								style={{ font: '11px Open Sans' }}
							>
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
								points={`0,${arrowOffset * (index + 1)} 40,${arrowOffset * (index + 1)}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={negArrowColor}
							/>,
							<text
								key={`negArrowLabel_${index}`}
								x="50"
								y={arrowOffset * (index + 1) + labelOffset}
								style={{ font: '11px Open Sans' }}
							>
								{`≤ ${posArrowBounds[index].toFixed(0)}`}
							</text>,
						]);
					}
					break;
				case 'Saldi':
					for (let index = 0; index < arrowWidths.length; index++) {
						arrows.push([
							<polyline
								key={`negArrow_${index}`}
								points={`0,${arrowOffset * (index + 1)} 40,${arrowOffset * (index + 1)}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={posArrowColor}
							/>,
							<text
								key={`negArrowLabel_${index}`}
								x="50"
								y={arrowOffset * (index + 1) + labelOffset}
								style={{ font: '11px Open Sans' }}
							>
								{`≥ -${negArrowBounds[index].toFixed(0)}`}
							</text>,
							<polyline
								key={`posArrow_${index}`}
								points={`130,${arrowOffset * (index + 1)} 170,${arrowOffset * (index + 1)}`}
								strokeWidth={arrowWidths[index]}
								fill="none"
								stroke={negArrowColor}
							/>,
							<text
								key={`posArrowLabel_${index}`}
								x="180"
								y={arrowOffset * (index + 1) + labelOffset}
								style={{ font: '11px Open Sans' }}
							>
								{`≤ ${posArrowBounds[index].toFixed(0)}`}
							</text>,
						]);
					}
					break;
			}
		}

		return (
			<svg key="arrowLegend" height={arrowOffset * arrowWidths.length + arrowOffset}>
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
			title += " (" + this.props.yearsSelected + ")";
		}
		return title;
	}

	private createBox(color: string, x: number, y: number, index: string): object {
		return (
			<rect
				key={'box-' + color + '-' + index}
				fill={color}
				stroke={this.stroke_color}
				width={this.box_width}
				height={this.box_height}
				x={x}
				y={y}
			></rect>
		);
	}

	private createLine(color: string, key: string, x1: number, y1: number, x2: number, y2: number): object {
		return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} />;
	}

	private createLabel(label: string, x: number, y: number, index: string): object {
		let offset = label.length * this.label_char_width * 0.5;
		return (
			<text key={'label-' + label + '-' + index} x={x - offset} y={y} style={{ font: '11px Open Sans' }}>
				{label}
			</text>
		);
	}

	private createLeftLabel(label: string, x: number, y: number, index: string): object {
		return (
			<text key={'label-' + label + '-' + index} x={x} y={y} style={{ font: '11px Open Sans' }}>
				{label}
			</text>
		);
	}

	private createRightLabel(label: string, x: number, y: number, index: string): object {
		let offset = label.length * this.label_char_width;
		return (
			<text key={'label-' + label + '-' + index} x={x - offset} y={y} style={{ font: '11px Open Sans' }}>
				{label}
			</text>
		);
	}

	private createNeutralBox(has_zero: boolean, color: string, x: number, y: number): object {
		if (!has_zero) return <svg width="0" height="0"></svg>;
		const box = this.createBox(color, x, y, 'neutral');
		const label = this.createLabel('0', this.box_width + this.label_char_width * 3 + x, this.box_height - 6 + y, 'neutral');
		return (
			<svg x={0} y={0} width={this.box_width + this.label_char_width * 5 + x} height={this.box_height + y}>
				{box}
				{label}
			</svg>
		);
	}

	private createPositiveScale(scales: number[] | null, colors: string[], offset: number): object {
		if (scales == null) return <svg></svg>;
		Log.debug("positive scales: ", scales);
		let boxes = [];
		for (let i = 0; i < colors.length; i++) boxes.push(this.createBox(colors[i], i * this.box_width + this.label_offset, 0, 'positive-' + i));
		let lines = [];
		let labels = [];
		for (let i = 0; i < scales.length; i++) {
			labels.push(this.createLabel('' + scales[i], i * this.box_width + this.label_offset, this.box_height + 21, 'positive-' + i));
			lines.push(
				this.createLine(
					this.stroke_color,
					'positive-' + i,
					i * this.box_width + this.label_offset,
					this.box_height,
					i * this.box_width + this.label_offset,
					this.box_height + 10
				)
			);
		}
		return (
			<svg x={offset} y={0}>
				{boxes}
				{lines}
				{labels}
			</svg>
		);
	}

	private createNegativeScale(scales: number[] | null, colors: string[], index: number): object {
		if (scales == null) return <svg></svg>;
		Log.debug("negative scales: ", scales);
		let boxes = [];
		for (let i = 0; i < colors.length; i++)
			boxes.push(this.createBox(colors[colors.length - i - 1], i * this.box_width + this.label_offset, 0, 'negative-' + i));
		let lines = [];
		let labels = [];
		for (let i = 0; i < scales.length; i++) {
			labels.push(this.createLabel('' + scales[scales.length - i - 1], i * this.box_width + this.label_offset, this.box_height + 21, 'negative-' + i));
			lines.push(
				this.createLine(
					this.stroke_color,
					'negative-' + i,
					i * this.box_width + this.label_offset,
					this.box_height,
					i * this.box_width + this.label_offset,
					this.box_height + 10
				)
			);
		}
		return (
			<svg x={index * this.box_width} y={0}>
				{boxes}
				{lines}
				{labels}
			</svg>
		);
	}
}
