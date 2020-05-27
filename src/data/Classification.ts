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

  private location: string|null = null;
  private theme: string|null = null;

  public static getCurrentClassification(): Classification
  {
    return Classification.current;
  }

  public getColor(item: {[name: string]: any})
  {
    if ((item == null) || (item.Wert == 0)) return "#ffffff";
    if (this.theme === 'Von')
    {
      if (this.location === item.Nach) return "#cbf719";
    }
    else
    {
      if (this.location === item.Von) return "#cbf719";
    }
    if (item.Wert > 0) return "#0000ff";
    if (item.Wert < 0) return "#ff0000";
    return "#ffffff";
  }

  public setLocation(location: string|null)
  {
    this.location = location;
  }

  public setTheme(theme: string|null)
  {
    this.theme = theme;
  }

}