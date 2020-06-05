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

  private positive_scales: number[]|null = null;
  private negative_scales: number[]|null = null;

  public static getCurrentClassification(): Classification
  {
    return Classification.current;
  }

  public getColor(item: {[name: string]: any})
  {
    if (item == null) return this.error_color;
    if ((this.theme === 'Von') && (this.location === item.Nach)) return this.selected_color;
    if ((!(this.theme === 'Von')) && (this.location === item.Von)) return this.selected_color;
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

  public calculateClassification(items: {[name: string]: any}[])
  {
    this.positive_scales = null;
    this.negative_scales = null;
    let max = 0;
    let min = 0;
    for (let item of items)
    {
      if (item.Wert > max) max = item.Wert;
      if (item.Wert < min) min = item.Wert;
    }
    if (max > 0)
    {
      let numcolors = this.positive_colors.length
      let step = max / numcolors;
      this.positive_scales = [];
      for (let i = 1; i < numcolors; i++) this.positive_scales.push(Math.ceil(i*step));
      this.positive_scales.push(max);
    }
    if (min < 0)
    {
      let numcolors = this.negative_colors.length
      let step = min / numcolors;
      this.negative_scales = [];
      for (let i = 1; i < numcolors; i++) this.negative_scales.push(Math.floor(i*step));
      this.negative_scales.push(min);
    }
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

}