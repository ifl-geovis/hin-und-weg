import React from 'react';

import Classification from '../../data/Classification';

export interface ILegendTimelineProps {
    yearsSelected: string[];

}

export default class LegendTimeline extends React.Component<ILegendTimelineProps> {
	private stroke_color = '#4d4d4d';
	private box_size = 20;
	private label_offset = 15;

	constructor(props: ILegendTimelineProps) {
		super(props);
	}

	public render(): JSX.Element {
		return this.createLegend();
	}

	private createLegend(): JSX.Element {
		const classification = Classification.getCurrentClassification();

		let timelinePositiveColors = classification.getZeitreihenPositiveColors();
		let timelineNegativeColors = classification.getZeitreihenNegativeColors();


		const wegzug = this.createBox(timelineNegativeColors[0], 2, 0, "wegzug")
		const zuzug = this.createBox(timelinePositiveColors[0], 120, 0, "zuzug")
		const negative_circle = this.createCircle(timelineNegativeColors[1], 2 + this.box_size/2, this.box_size + 5+ this.box_size/2 )
		const positive_circle = this.createCircle(timelinePositiveColors[1], 120 + this.box_size/2, this.box_size + 5+ this.box_size/2 )
		const wegzugLabel = this.createLabel(' - Wegzug', this.box_size + 7,  this.label_offset, 'wegzugLabel');
		const zuzugLabel = this.createLabel(' - Zuzug', this.box_size + 125, this.label_offset, 'zuzugLabel');
		const positiveSaldiLabel = this.createLabel(' - positive Saldi ', this.box_size + 7, this.box_size + 5 + this.label_offset, 'positiveSaldiLabel');
		const negativeSaldiLabel = this.createLabel(' - negative Saldi ', this.box_size + 125, this.box_size + 5 + this.label_offset, 'negativeSaldiLabel');


		
		return (
			<div>
				<h4>{this.createLegendTitle(classification)}</h4>
				<svg key="legend" width={300} height={3*this.box_size } style={{ display: 'block' }}>
					{' '}
					{zuzug}
					{zuzugLabel}		
					{positive_circle}
					{positiveSaldiLabel}
					{wegzug}
					{wegzugLabel}
					{negative_circle}
					{negativeSaldiLabel}
				</svg>
			</div>
		);
	}



	private createLegendTitle(classification: Classification): string {
		let title = 'Zeitreihen';
		const location = classification.getLocation();
		const theme = classification.getTheme();
		if (location && theme) {
			title += ' für ';

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
				width={index === 'neutral' ? this.box_size * 0.5 : this.box_size}
				height={this.box_size}
				x={x}
				y={y}
			></rect>
		);
	}

	private createCircle(color: string, x: number, y: number): object {
		return (
			<circle 
			key={'circle-' + color }
			cx={x} cy={y} r={this.box_size/2} fill={color}
			stroke={this.stroke_color}
			
			></circle>
			
		);
	}



	// Open Sans - font as in other elements
	private createLabel(label: string, x: number, y: number, index: string): object {
		return (
			<text key={'label-' + label + '-' + index} x={x} y={y} style={{ font: '13px Open Sans' }}>
				{/* { font: '10px sans-serif' } */}
				{label}
			</text>
		);
	}

	
}