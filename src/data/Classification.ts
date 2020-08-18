import geostats from 'geostats';

export interface Item
{
	Von: string;
	Nach: string;
	Wert: number;
	Absolutwert: number;
}


/**
	Represents the current classification and delivers the color.
 */
export default class Classification
{

	private static current: Classification = new Classification();

	// Taken from http://colorbrewer2.org/
	//http://colorbrewer2.org/#type=diverging&scheme=RdBu&n=11
	private positive_colors = ["#fddbc7", "#f4a582", "#d6604d", "#b2182b", "#67001f"];
	private negative_colors = ["#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
	//private colorsAll = ['#67001f','#b2182b','#d6604d','#f4a582','#fddbc7','#f7f7f7',"#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];
	private neutral_color = '#f7f7f7';
	private selected_color = '#cbf719';
	private error_color = '#000000';

	private location: string|null = null;
	private theme: string|null = null;
	private query: {[name: string]: any}[] = [];

	private positive_stats: any;
	private negative_stats: any;

	private positive_scales: number[]|null = null;
	private negative_scales: number[]|null = null;

	public static getCurrentClassification(): Classification
	{
		return Classification.current;
	}

	public getBorderColor(item: { [name: string]: any }) {
		if (item == null) return this.error_color;
		if (this.theme === 'Von' && this.location === item.Nach) return this.selected_color;
		if (!(this.theme === 'Von') && this.location === item.Von) return this.selected_color;
		else return '#585858';
	}

	public getColor(item: {[name: string]: any})
	{
		if (item == null) return this.error_color;
		//if ((this.theme === 'Von') && (this.location === item.Nach)) return this.selected_color;
		//if ((!(this.theme === 'Von')) && (this.location === item.Von)) return this.selected_color;
		if (item.Wert == 0) return this.neutral_color;
		if (item.Wert > 0)
		{
			if (this.positive_scales === null) return this.positive_colors[this.positive_colors.length - 1];
			for (let i = 0; i < this.positive_scales.length; i++)
			{
				if (item.Wert < this.positive_scales[i]) return this.positive_colors[i];
			}
			return this.positive_colors[this.positive_colors.length - 1];
		}
		if (item.Wert < 0)
		{
			if (this.negative_scales === null) return this.negative_colors[this.negative_colors.length - 1];
			for (let i = 0; i < this.negative_scales.length; i++)
			{
				if (item.Wert > this.negative_scales[i]) return this.negative_colors[i];
			}
			return this.negative_colors[this.negative_colors.length - 1];
		}
		return this.error_color;
	}

	public setLocation(location: string|null)
	{
		this.location = location;
	}

	public setTheme(theme: string|null)
	{
		this.theme = theme;
	}

	public setQuery(query: {[name: string]: any}[])
	{
		this.query = query;
		this.calculateClassification();
	}

	private getRanges(stats: any, count: number): any[]
	{
		return stats.getClassEqInterval(count);
	}

	private fillPositiveScales()
	{
		this.positive_scales = [];
		const ranges = this.getRanges(this.positive_stats, this.positive_colors.length);
		for (let i = 1; i < ranges.length; i++) this.positive_scales.push(ranges[i]);
	}

	private fillNegativeScales()
	{
		this.negative_scales = [];
		const ranges = this.getRanges(this.negative_stats, this.negative_colors.length);
		for (let i = ranges.length - 1; i >= 0; i--) this.negative_scales.push(ranges[i]);
	}

	public calculateClassification()
	{
		this.positive_scales = null;
		this.negative_scales = null;
		var positives = [];
		var negatives = [];
		for (let item of this.query)
		{
			if (item.Wert > 0) positives.push(item.Wert);
			if (item.Wert < 0) negatives.push(item.Wert);
		}
		if (positives.length > 0)
		{
			this.positive_stats = new geostats(positives);
			this.fillPositiveScales();
		}
		else
		{
			this.positive_stats = new geostats([0]);
		}
		if (negatives.length > 0)
		{
			this.negative_stats = new geostats(negatives);
			this.fillNegativeScales();
		}
		else
		{
			this.negative_stats = new geostats([0]);
		}
		console.log(this.positive_stats.getClassEqInterval(this.positive_colors.length));
		console.log(this.getRanges(this.positive_stats, this.positive_colors.length));
		console.log(this.positive_scales);
		console.log(this.negative_stats.getClassEqInterval(this.negative_colors.length));
		console.log(this.getRanges(this.negative_stats, this.negative_colors.length));
		console.log(this.negative_scales);
	}

	public getMinValue(): number
	{
		return this.negative_stats.min();
	}

	public getMaxValue(): number
	{
		return this.positive_stats.max();
	}

	public getSelectedColor(): string
	{
		return this.selected_color;
	}

	public getNeutralColor(): string
	{
		return this.neutral_color;
	}

	public getNegativeColors(): string[]
	{
		return this.negative_colors;
	}

	public getPositiveColors(): string[]
	{
		return this.positive_colors;
	}

	public getNegativeScales(): number[]|null
	{
		return this.negative_scales;
	}

	public getPositiveScales(): number[]|null
	{
		return this.positive_scales;
	}

	public setPositiveColors(colorScheme: string[])
	{
		this.positive_colors = colorScheme;
		this.calculateClassification();
	}

	public setNegativeColors(colorScheme: string[])
	{
		this.negative_colors = colorScheme;
		this.calculateClassification();
	}

}