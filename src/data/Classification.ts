import geostats from 'geostats';

import Log from '../log';
import Config from "../config";
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
	private static current: Classification = new Classification();

	// Taken from http://colorbrewer2.org/
	//http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=11
	private positive_colors = ['#fddbc7', '#f4a582', '#d6604d', '#b2182b', '#67001f'];
	private negative_colors = ['#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'];
	//private colorsAll = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7',"#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
	private neutral_color = '#f7f7f7';
	private selected_color = '#cbf719';
	private error_color = '#000000';
	private positive_arrow_color = '#ff0000';
	private negative_arrow_color = '#0432ff';

	private location: string | null = null;
	private theme: string | null = null;
	private query: { [name: string]: any }[] = [];
	private algorithm: string = 'equidistant';

	private positive_stats: any;
	private negative_stats: any;

	private positive_scales: number[] | null = null;
	private negative_scales: number[] | null = null;

	private positiveArrowWidthBounds: Array<number> = [];
	private negativeArrowWidthBounds: Array<number> = [];
	private arrowWidths: Array<number> = [1, 3, 4, 5];

	private colorSchemeDefault = ['cc8844', 'bb8855', 'aa8866', '998877', '888888', '778899', '6688aa', '5588bb', '4488cc'];
	private classificationPositiveDefault = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	private classificationNegativeDefault = [-1, -2, -3, -4, -5, -6, -7, -8, -9];

	private userDefinedColorSchemes = ['scheme1', 'scheme2', 'scheme3', 'scheme4', 'scheme5', 'scheme6'];

	public static getCurrentClassification(): Classification {
		return Classification.current;
	}

	public getBorderColor(item: { [name: string]: any }) {
		if (item == null) return this.error_color;
		//	if (this.theme === 'Von' && this.location === item.Nach) return this.selected_color;
		//	if (!(this.theme === 'Von') && this.location === item.Von) return this.selected_color;
		else return '#585858';
	}

	public getColor(item: { [name: string]: any }) {
		if (item == null) return this.error_color;
		//if ((this.theme === 'Von') && (this.location === item.Nach)) return this.selected_color;
		//if ((!(this.theme === 'Von')) && (this.location === item.Von)) return this.selected_color;
		if (item.Wert == 0) return this.neutral_color;
		if (item.Wert > 0) {
			if (this.positive_scales === null) return this.positive_colors[this.positive_colors.length - 1];
			for (let i = 0; i < this.positive_scales.length; i++) {
				if (item.Wert < this.positive_scales[i]) return this.positive_colors[i];
			}
			return this.positive_colors[this.positive_colors.length - 1];
		}
		if (item.Wert < 0) {
			if (this.negative_scales === null) return this.negative_colors[this.negative_colors.length - 1];
			for (let i = 0; i < this.negative_scales.length; i++) {
				if (item.Wert > this.negative_scales[i]) return this.negative_colors[i];
			}
			return this.negative_colors[this.negative_colors.length - 1];
		}
		return this.error_color;
	}

	public setLocation(location: string | null) {
		this.location = location;
	}

	public setTheme(theme: string | null) {
		this.theme = theme;
	}

	public setQuery(query: { [name: string]: any }[]) {
		this.query = query;
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
		let classification = Settings.getValue('classification', (positive ? 'positive' : 'negative'));
		if (classification == null) classification = (positive ? this.classificationPositiveDefault : this.classificationNegativeDefault);
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
		return this.theme;
	}

	public getLocation(): string | null {
		return this.location;
	}

	private roundValue(num: number): number {
		return Math.round(num);
	}

	private fillPositiveScales() {
		this.positive_scales = [];
		let ranges = [];
		if (this.algorithm == 'custom') ranges = this.getCustomRanges(true, this.positive_colors.length);
		else ranges = this.getRanges(this.positive_stats, this.positive_colors.length);
		for (let i = 1; i < ranges.length; i++) this.positive_scales.push(this.roundValue(ranges[i]));
	}

	private fillNegativeScales() {
		this.negative_scales = [];
		let ranges = [];
		if (this.algorithm == 'custom') ranges = this.getCustomRanges(false, this.negative_colors.length);
		else ranges = this.getRanges(this.negative_stats, this.negative_colors.length);
		for (let i = ranges.length - 2; i >= 0; i--) this.negative_scales.push(this.roundValue(ranges[i]));
	}

	public calculateClassification() {
		this.positive_scales = null;
		this.negative_scales = null;
		let positives = [];
		let negatives = [];
		for (let item of this.query) {
			if (item.Wert > 0) positives.push(item.Wert);
			if (item.Wert < 0) negatives.push(item.Wert);
		}
		Log.debug('positives: ' + positives);
		Log.debug('negatives: ' + negatives);
		if (positives.length > 0) {
			this.positive_stats = new geostats(positives);
			this.fillPositiveScales();
		} else {
			this.positive_stats = new geostats([0]);
		}
		if (negatives.length > 0) {
			this.negative_stats = new geostats(negatives);
			this.fillNegativeScales();
		} else {
			this.negative_stats = new geostats([0]);
		}
		this.calculatePositiveArrowBounds(this.positive_stats.min(), this.positive_stats.max());
		this.calculateNegativeArrowBounds(Math.abs(this.negative_stats.max()), Math.abs(this.negative_stats.min()));
	}

	public calculatePositiveArrowBounds(min: number, max: number) {
		this.positiveArrowWidthBounds = [];
		let countParts = this.arrowWidths.length;
		let parts = (max - min) / countParts;
		for (let i = 1; i <= countParts; i++) {
			this.positiveArrowWidthBounds.push(min + i * parts);
		}
	}
	public calculateNegativeArrowBounds(min: number, max: number) {
		this.negativeArrowWidthBounds = [];
		let countParts = this.arrowWidths.length;
		let parts = (max - min) / countParts;
		for (let i = 1; i <= countParts; i++) {
			this.negativeArrowWidthBounds.push(min + i * parts);
		}
	}

	public getMinValue(): number {
		return this.negative_stats.min();
	}

	public getMaxValue(): number {
		return this.positive_stats.max();
	}

	public getSelectedColor(): string {
		return this.selected_color;
	}

	public getNeutralColor(): string {
		return this.neutral_color;
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

	public getPositiveArrowColor(): string {
		return this.positive_arrow_color;
	}

	public setPositiveArrowColor(color: string) {
		this.positive_arrow_color = color;
	}

	public getNegativeArrowColor(): string {
		return this.negative_arrow_color;
	}

	public setNegativeArrowColor(color: string) {
		this.negative_arrow_color = color;
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
		let colorschemes = Config.getKeys("colorschemes");
		for (let i = 0; i < this.userDefinedColorSchemes.length; i++) colorschemes.push(this.userDefinedColorSchemes[i]);
		return colorschemes;
	}

	public getPositiveArrowWidthBounds(): Array<number> {
		return this.positiveArrowWidthBounds;
	}
	public getNegativeArrowWidthBounds(): Array<number> {
		return this.negativeArrowWidthBounds;
	}
	public getArrowWidths(): Array<number> {
		return this.arrowWidths;
	}
}
