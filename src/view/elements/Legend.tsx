import { Polyline } from 'leaflet';
import React from 'react';

import Log from '../../log';
import BaseData from "../../data/BaseData";
import Classification from '../../data/Classification';
import { withNamespaces,WithNamespaces } from 'react-i18next';
import i18n from './../../i18n/i18nClient';
import { TFunction } from "i18next";

export interface ILegendProps extends WithNamespaces {
	basedata: BaseData;
	showCenter: string;
	yearsSelected: string[];
	noNaN?: boolean;
}

class Legend extends React.Component<ILegendProps> {
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
		const classification = this.props.basedata.getClassification();
		let i = 0;
		const negative_scales = classification.getNegativeScales();
		const negative_colors = classification.getNegativeColors();
		const negative = this.createNegativeScale(negative_scales, negative_colors, this.props.showCenter === '2');
		if (negative_scales != null) i += negative_colors.length;
		const numneg = i;
		i = 0;
		const positive_scales = classification.getPositiveScales();
		const positive_colors = classification.getPositiveColors();
		const positive = this.createPositiveScale(positive_scales, positive_colors, this.props.showCenter === '2');
		if (positive_scales != null) i += positive_colors.length;
		const neutral = this.createNeutralBox(classification.hasZeroValues(), classification.getNeutralColor(), classification.hasNanValues(), classification.getMissingColor(), this.label_offset, 6);
		const numpos = i;
		return (
			<div>
				<h4>{this.createLegendTitle(classification)}</h4>
				{negative}
				{positive}
				<br />
				{neutral}
			</div>
		);
	}

	private createLegendTitle(classification: Classification): string {
		const {t}:any = this.props ;
		let title = t('legend.title');
		const location = this.props.basedata.getLocation();
		const theme = this.props.basedata.getTheme();
		if (location && theme) {
			title += t('legend.for');
			if (theme == 'Von') title += t('legend.outgoing');
			else if (theme == 'Nach') title += t('legend.incoming');
			else if (theme == 'Saldi') title += t('legend.saldi');
			title += location;
			title += " (";
			let first: boolean = true;
			for (let year of this.props.yearsSelected) {
				if (!first) title += ", ";
				title += year;
				first = false;
			}
			title += ")";
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

	private createArrowLine(color: string, key: string, x: number, y: number, width: number): object {
		const x1 = x + 3;
		const x2 = x + this.box_width - 3;
		const y1 = y + 5;
		const y2 = y1;
		return <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} />;
	}

	private createLabel(label: string, x: number, y: number, index: string): object {
		let offset = label.length * this.label_char_width * 0.5;
		return (
			<text key={'label-' + label + '-' + index} x={x - offset} y={y} style={{ font: '11px Open Sans' }}>
				{this.standardizeOutput(label)}
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

	private createNeutralBox(has_zero: boolean, zero_color: string, has_nan: boolean, nan_color: string, x: number, y: number): object {
		if ((!has_zero) && (!has_nan)) return <svg width="0" height="0"></svg>;
		const zero_box = (has_zero) ? this.createBox(zero_color, x, y, 'neutral') : <svg></svg>;
		const zero_label = (has_zero) ? this.createLabel('0', this.box_width + this.label_char_width * 3 + x, this.box_height - 6 + y, 'neutral') : <svg></svg>;
		const offset = has_zero ? this.box_width + this.label_char_width * 7 + x : 0;
		const nan_box = (has_nan) ? this.createBox(nan_color, offset + x, y, 'neutral') : <svg></svg>;
		const nan_label = (has_nan) ? this.createLabel('NaN', offset + this.box_width + this.label_char_width * 3 + x, this.box_height - 6 + y, 'nan') : <svg></svg>;
		console.log("this.props.noNaN Legend: " + this.props.noNaN);
		return (
			this.props.noNaN ? 
			<svg x={0} y={0} width={offset + this.box_width + this.label_char_width * 10 + x} height={this.box_height + y}>
				{zero_box}
				{zero_label}
				
			</svg> :
			<svg x={0} y={0} width={offset + this.box_width + this.label_char_width * 10 + x} height={this.box_height + y}>
			{zero_box}
			{zero_label}
			{nan_box}
			{nan_label}
		</svg>
		);
	}

	private createPositiveScale(scales: number[] | null, colors: string[], arrows: boolean): object {
		if (scales == null) return <svg key="legend-positive" width={0} height={0}></svg>;
		const classification = this.props.basedata.getClassification();
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
			if (arrows && i > 0) lines.push(this.createArrowLine((classification.getTheme() == 'Von') ? classification.getPositiveArrowColor() : classification.getNegativeArrowColor(), 'arrow-positive-' + i, (i - 1) * this.box_width + this.label_offset, this.box_height, classification.calculateArrowWidth(i, scales.length)));
		}
		return (
			<svg key="legend-positive" width={(scales.length - 1) * this.box_width + 2 * this.label_offset} height={this.box_height + 22}>
				{boxes}
				{lines}
				{labels}
			</svg>
		);
	}

	private createNegativeScale(scales: number[] | null, colors: string[], arrows: boolean): object {
		if (scales == null) return <svg key="legend-negative" width={0} height={0}></svg>;
		const classification = this.props.basedata.getClassification();
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
			if (arrows && i > 0) lines.push(this.createArrowLine(classification.getPositiveArrowColor(), 'arrow-negative-' + i, (i - 1) * this.box_width + this.label_offset, this.box_height, classification.calculateArrowWidth(scales.length - i, scales.length)));
		}
		return (
			<svg key="legend-negative" width={(scales.length - 1) * this.box_width + 2 * this.label_offset} height={this.box_height + 22}>
				{boxes}
				{lines}
				{labels}
			</svg>
		);
	}

	private standardizeOutput(label: string): string
	{
		if (i18n.language == "en") return label.replace(",", ".");
		return label.replace("\.", ",");
	}

}
export default withNamespaces()(Legend);
