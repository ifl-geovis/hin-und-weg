import geostats from 'geostats';

import BaseData from './BaseData';
import Log from '../log';
import Config from '../config';
import Settings from '../settings';

export interface Item {
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}

/**
	Represents the current classification and delivers the color.
 */
export default class Classification {

	// Taken from http://colorbrewer2.org/
	//http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=11
	private positive_colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
	private negative_colors = ['#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
	//private colorsAll = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7',"#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
	private selected_color = '#cbf719';
	private error_color = '#000000';

	private basedata: BaseData;

	private algorithm: string = 'equidistant';

	private positive_stats: any;
	private negative_stats: any;

	private zero_values: boolean = false;
	private nan_values: boolean = false;

	private positive_scales: number[] | null = null;
	private positive_scales_d3labels: number[] | null = null;

	private negative_scales: number[] | null = null;
	private negative_scales_d3labels: number[] | null = null;

	private arrow_max_width = 6;

	private distinct_positives: number = 1;
	private distinct_negatives: number = 1;

	private colorSchemeDefault = ['cc8844', 'bb8855', 'aa8866', '998877', '888888', '778899', '6688aa', '5588bb', '4488cc'];
	private classificationPositiveDefault = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	private classificationNegativeDefault = [-1, -2, -3, -4, -5, -6, -7, -8, -9];

	private userDefinedColorSchemes = ['scheme1', 'scheme2', 'scheme3', 'scheme4', 'scheme5', 'scheme6'];

	constructor(basedata: BaseData) {
		this.basedata = basedata;
	}

	public getBorderColor(item: { [name: string]: any }) {
		if (item == null) return this.error_color;
		else return '#585858';
	}

	public getColor(item: { [name: string]: any }) {
		if (item == null) return this.error_color;
		if (isNaN(item.Wert)) return this.getMissingColor();
		if (item.Wert == 0) return this.getNeutralColor();
		if (item.Wert > 0) {
			if (this.positive_scales === null) return this.positive_colors[this.positive_colors.length - 1];
			for (let i = 0; i < this.positive_scales.length; i++) {
				if ((i < (this.positive_scales.length - 1)) && (item.Wert == this.positive_scales[i])) return this.positive_colors[i];
				if (item.Wert < this.positive_scales[i]) return this.positive_colors[i - 1];
			}
			return this.positive_colors[this.positive_colors.length - 1];
		}
		if (item.Wert < 0) {
			if (this.negative_scales === null) return this.negative_colors[this.negative_colors.length - 1];
			for (let i = 0; i < this.negative_scales.length; i++) {
				if ((i < (this.negative_scales.length - 1)) && (item.Wert == this.negative_scales[i])) return this.negative_colors[i];
				if (item.Wert > this.negative_scales[i]) return this.negative_colors[i - 1];
			}
			return this.negative_colors[this.negative_colors.length - 1];
		}
		return this.error_color;
	}

	public getZeitreihenPositiveColors() {
		let positiveColorBright = this.error_color;
		let positiveColorDark = this.error_color;
		if (this.positive_colors.length === 1) {
			positiveColorBright = this.positive_colors[0];
			positiveColorDark = this.positive_colors[0];
		} else if (this.positive_colors.length === 2) {
			positiveColorBright = this.positive_colors[0];
			positiveColorDark = this.positive_colors[1];
		} else if (this.positive_colors.length === 3) {
			positiveColorBright = this.positive_colors[1];
			positiveColorDark = this.positive_colors[2];
		} else if (this.positive_colors.length === 4) {
			positiveColorBright = this.positive_colors[2];
			positiveColorDark = this.positive_colors[3];
		} else if (this.positive_colors.length === 5) {
			positiveColorBright = this.positive_colors[2];
			positiveColorDark = this.positive_colors[4];
		} else if (this.positive_colors.length === 6) {
			positiveColorBright = this.positive_colors[3];
			positiveColorDark = this.positive_colors[5];
		} else if (this.positive_colors.length === 7) {
			positiveColorBright = this.positive_colors[3];
			positiveColorDark = this.positive_colors[6];
		} else if (this.positive_colors.length === 8) {
			positiveColorBright = this.positive_colors[3];
			positiveColorDark = this.positive_colors[7];
		} else if (this.positive_colors.length === 9) {
			positiveColorBright = this.positive_colors[3];
			positiveColorDark = this.positive_colors[7];
		}
		return [positiveColorBright, positiveColorDark];
	}

	public getZeitreihenNegativeColors() {
		let positiveColorBright = this.error_color;
		let positiveColorDark = this.error_color;
		let negativeColorBright = this.error_color;
		let negativeColorDark = this.error_color;
		if (this.negative_colors.length === 1) {
			negativeColorBright = this.negative_colors[0];
			negativeColorDark = this.negative_colors[0];
		} else if (this.negative_colors.length === 2) {
			negativeColorBright = this.negative_colors[0];
			negativeColorDark = this.negative_colors[1];
		} else if (this.negative_colors.length === 3) {
			negativeColorBright = this.negative_colors[1];
			negativeColorDark = this.negative_colors[2];
		} else if (this.negative_colors.length === 4) {
			negativeColorBright = this.negative_colors[2];
			negativeColorDark = this.negative_colors[3];
		} else if (this.negative_colors.length === 5) {
			negativeColorBright = this.negative_colors[2];
			negativeColorDark = this.negative_colors[4];
		} else if (this.negative_colors.length === 6) {
			negativeColorBright = this.negative_colors[3];
			negativeColorDark = this.negative_colors[5];
		} else if (this.negative_colors.length === 7) {
			negativeColorBright = this.negative_colors[3];
			negativeColorDark = this.negative_colors[6];
		} else if (this.negative_colors.length === 8) {
			negativeColorBright = this.negative_colors[3];
			negativeColorDark = this.negative_colors[7];
		} else if (this.negative_colors.length === 9) {
			negativeColorBright = this.negative_colors[3];
			negativeColorDark = this.negative_colors[7];
		}
		return [negativeColorBright, negativeColorDark];
	}

	public setAlgorithm(algorithm: string) {
		this.algorithm = algorithm;
	}

	public setPositiveColors(colorScheme: string[]) {
		this.positive_colors = colorScheme;
	}

	public setNegativeColors(colorScheme: string[]) {
		this.negative_colors = colorScheme;
	}

	public hasZeroValues(): boolean {
		return this.zero_values;
	}

	public hasNanValues(): boolean {
		return this.nan_values;
	}

	private getRanges(stats: any, count: number): any[] {
		// documentation for geostats: https://github.com/simogeo/geostats
		Log.debug(stats.info());
		Log.debug(stats.sorted());
		try {
			if (this.algorithm == 'equidistant') return stats.getClassEqInterval(count);
			if (this.algorithm == 'stddeviation') return stats.getClassStdDeviation(count);
			if (this.algorithm == 'arithmetic_progression') return stats.getClassArithmeticProgression(count);
			if (this.algorithm == 'geometric_progression') return stats.getClassGeometricProgression(count);
			if (this.algorithm == 'quantile') return stats.getClassQuantile(count);
			if (this.algorithm == 'jenks') return stats.getClassJenks(count);
		} catch (e) {
			Log.debug(e);
		}
		return stats.getClassEqInterval(count);
	}

	private getCustomRanges(positive: boolean, count: number): any[] {
		let classification = Settings.getValue('classification', positive ? 'positive' : 'negative');
		if (classification == null) classification = positive ? this.classificationPositiveDefault : this.classificationNegativeDefault;
		let ranges = [];
		if (positive) {
			ranges.push(0);
			for (let i = 0; i < count; i++) ranges.push(classification[i]);
		} else {
			ranges.unshift(0);
			for (let i = 0; i < count; i++) ranges.unshift(classification[i]);
		}
		return ranges;
	}

	public getTheme(): string | null {
		return this.basedata.getTheme();
	}

	public getLocation(): string | null {
		return this.basedata.getLocation();
	}

	public getAlgorithm(): string | null {
		return this.algorithm;
	}

	private roundValue(num: number): number {
		return Math.round(num);
	}

	private roundValueThree(num: number): number {
		return parseFloat(num.toFixed(3));
	}

	private fillPositiveScales() {
		this.positive_scales = [];
		let ranges = [];
		if (this.algorithm == 'custom') ranges = this.getCustomRanges(true, this.positive_colors.length);
		else ranges = this.getRanges(this.positive_stats, this.positive_colors.length);
		if ((this.basedata.getDataProcessing() === 'wanderungsrate') || (this.basedata.getDataProcessing() === 'ratevon') || (this.basedata.getDataProcessing() === 'ratenach')) {
			for (let i = 0; i < ranges.length; i++) this.positive_scales.push(this.roundValueThree(ranges[i]));
		} else {
			this.positive_scales.push(Math.floor(ranges[0]));
			for (let i = 1; i < ranges.length - 1; i++) this.positive_scales.push(this.roundValue(ranges[i]));
			this.positive_scales.push(Math.ceil(ranges[ranges.length - 1]));
		}
	}

	private fillPositiveScalesD3Labels() {
		this.positive_scales_d3labels = [];
		let ranges = [];
		if (this.algorithm == 'custom') ranges = this.getCustomRanges(true, this.positive_colors.length);
		else ranges = this.getRanges(this.positive_stats, this.positive_colors.length);
		if ((this.basedata.getDataProcessing() === 'wanderungsrate') || (this.basedata.getDataProcessing() === 'ratevon') || (this.basedata.getDataProcessing() === 'ratenach')) {
			for (let i = 0; i < ranges.length; i++) this.positive_scales_d3labels.push(this.roundValueThree(ranges[i]));
		} else {
			for (let i = 0; i < ranges.length; i++) this.positive_scales_d3labels.push(this.roundValue(ranges[i]));
		}
	}

	private fillNegativeScales() {
		this.negative_scales = [];
		let ranges = [];
		if (this.algorithm == 'custom') ranges = this.getCustomRanges(false, this.negative_colors.length);
		else ranges = this.getRanges(this.negative_stats, this.negative_colors.length);
		if ((this.basedata.getDataProcessing() === 'wanderungsrate') || (this.basedata.getDataProcessing() === 'ratevon') || (this.basedata.getDataProcessing() === 'ratenach')) {
			for (let i = ranges.length - 1; i >= 0; i--) this.negative_scales.push(this.roundValueThree(ranges[i]));
		} else {
			this.negative_scales.push(Math.ceil(ranges[ranges.length - 1]));
			for (let i = ranges.length - 2; i >= 1; i--) this.negative_scales.push(this.roundValue(ranges[i]));
			this.negative_scales.push(Math.floor(ranges[0]));
		}
	}

	private fillNegativeScalesD3Labels() {
		this.negative_scales_d3labels = [];
		let ranges = [];
		if (this.algorithm == 'custom') ranges = this.getCustomRanges(false, this.negative_colors.length);
		else ranges = this.getRanges(this.negative_stats, this.negative_colors.length);
		if ((this.basedata.getDataProcessing() === 'wanderungsrate') || (this.basedata.getDataProcessing() === 'ratevon') || (this.basedata.getDataProcessing() === 'ratenach')) {
			for (let i = 0; i < ranges.length; i++) this.negative_scales_d3labels.push(this.roundValueThree(ranges[i]));
		} else {
			for (let i = 0; i < ranges.length; i++) this.negative_scales_d3labels.push(this.roundValue(ranges[i]));
		}
	}

	public calculateClassification() {
		this.positive_scales = null;
		this.negative_scales = null;
		this.positive_scales_d3labels = null;
		this.negative_scales_d3labels = null;
		this.zero_values = false;
		this.nan_values = false;
		let positives = [];
		let negatives = [];
		for (let item of this.basedata.query()) {
			if (!isNaN(item.Wert)) {
				if (item.Wert > 0) positives.push(item.Wert);
				if (item.Wert < 0) negatives.push(item.Wert);
				if (item.Wert == 0) this.zero_values = true;
			}
			else this.nan_values = true;
		}
		Log.trace('positives: ' + positives);
		Log.trace('negatives: ' + negatives);
		this.distinct_positives = 1;
		this.distinct_negatives = 1;
		if (positives.length > 0) {
			let foundvalues: number[] = [];
			for (let value of positives) {
				if (!foundvalues.includes(value)) foundvalues.push(value);
			}
			this.distinct_positives = foundvalues.length;
			this.positive_stats = new geostats(positives);
			this.fillPositiveScales();
			this.fillPositiveScalesD3Labels();
		} else {
			this.positive_stats = new geostats([0]);
		}
		if (negatives.length > 0) {
			let foundvalues: number[] = [];
			for (let value of negatives) {
				if (!foundvalues.includes(value)) foundvalues.push(value);
			}
			this.distinct_negatives = foundvalues.length;
			this.negative_stats = new geostats(negatives);
			this.fillNegativeScales();
			this.fillNegativeScalesD3Labels();
		} else {
			this.negative_stats = new geostats([0]);
		}
	}

	// https://accendoreliability.com/sturges-rule-method-selecting-number-bins-histogram/
	public calculateSturgesRule(positive: boolean): number {
		let stats = positive ? this.positive_stats : this.negative_stats;
		if (stats == null) return 1;
		let number = stats.pop();
		/*if (number < 5) return 1;
		if (number < 10) return 2;
		if (number < 15) return 3;
		if (number < 20) return 4;*/
		//let sturges = Math.round(1 + 3.3 * Math.log10(number));
		let distinct_number = positive ? this.distinct_positives : this.distinct_negatives;
		/*Log.debug("sturges", sturges);
		Log.debug("distinct_number", distinct_number);
		Log.debug("count", Math.round(1 + Math.log(number)));
		if (sturges > distinct_number) return Math.round(1 + Math.log(distinct_number));*/
		return Math.round(Math.sqrt(distinct_number));
	}

	public getMinValue(): number {
		return this.negative_stats.min();
	}

	public getMaxValue(): number {
		return this.positive_stats.max();
	}

	public getAbsoluteMaxValue(): number {
		const minAbsoluteValue: number = Math.abs(this.getMinValue());
		const maxAbsoluteValue: number = Math.abs(this.getMaxValue());
		return minAbsoluteValue > maxAbsoluteValue ? minAbsoluteValue : maxAbsoluteValue;
	}

	public getSelectedColor(): string {
		return this.selected_color;
	}

	public getNeutralColor(): string {
		return '#' + Settings.getValue('user-colors', 'neutral-color');
	}

	public getMissingColor(): string {
		return '#' + Settings.getValue('user-colors', 'missing-color');
	}

	public getNegativeColors(): string[] {
		return this.negative_colors;
	}

	public getPositiveColors(): string[] {
		return this.positive_colors;
	}

	public getNegativeScales(): number[] | null {
		return this.negative_scales;
	}

	public getPositiveScales(): number[] | null {
		return this.positive_scales;
	}

	public getPositiveScalesD3Labels(): number[] | null {
		return this.positive_scales_d3labels;
	}

	public getNegativeScalesD3Labels(): number[] | null {
		return this.negative_scales_d3labels;
	}

	public getPositiveArrowColor(): string {
		Log.debug(Settings.getValue('user-colors', 'arrow-positive-color'));
		return '#' + Settings.getValue('user-colors', 'arrow-positive-color');
	}

	public getNegativeArrowColor(): string {
		return '#' + Settings.getValue('user-colors', 'arrow-negative-color');
	}

	public getColorScheme(colorScheme: string, classes: string) {
		let result = [];
		if (this.userDefinedColorSchemes.includes(colorScheme)) {
			const number = parseInt(classes, 10);
			let temp = Settings.getValue('user-color-schemes', colorScheme);
			if (!temp) temp = this.colorSchemeDefault;
			for (let i = 0; i < number; i++) result.push('#' + temp[i]);
		} else {
			result = Config.getValue('colorschemes', colorScheme)[classes];
		}
		return result;
	}

	public getColorSchemes(): string[] {
		let colorschemes = Config.getKeys('colorschemes');
		for (let i = 0; i < this.userDefinedColorSchemes.length; i++) colorschemes.push(this.userDefinedColorSchemes[i]);
		return colorschemes;
	}

	public getArrowWidth(value: number): number {
		if (isNaN(value) || (value == 0)) return 0;
		if (value > 0) {
			if (this.positive_scales === null) return Math.floor(this.arrow_max_width / 2);
			for (let i = 0; i < this.positive_scales.length; i++) {
				if (value < this.positive_scales[i]) return this.calculateArrowWidth(i, this.positive_scales.length);
			}
			return this.arrow_max_width;
		}
		if (value < 0) {
			if (this.negative_scales === null) return Math.floor(this.arrow_max_width / 2);
			for (let i = 0; i < this.negative_scales.length; i++) {
				if (value > this.negative_scales[i]) return this.calculateArrowWidth(i, this.negative_scales.length);
			}
			return this.arrow_max_width;
		}
		return Math.ceil(this.arrow_max_width / 2);
	}

	public calculateArrowWidth(index: number, max: number) {
		const width = Math.floor((index / max) * this.arrow_max_width);
		return (width == 0) ? 1 : width;
	}

	public getPositiveStatsSerie(): any {
		return this.positive_stats.serie;
	}

	public getNegativeStatsSerie(): any {
		return this.negative_stats.serie;
	}

}
