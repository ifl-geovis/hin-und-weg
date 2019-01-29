require(["vendor/amcharts4/core", "vendor/amcharts4/charts", 'vendor/amcharts4/themes/animated', 'double-bar/districts', 'double-bar/colors'],
	function (am4core, am4charts, am4themes_animated, data, colors) {

		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		// Create chart instance
		var mainContainer = am4core.create("chartdiv", am4core.Container);
		mainContainer.width = am4core.percent(100);
		mainContainer.height = am4core.percent(100);
		mainContainer.layout = "horizontal";

		var maleChart = mainContainer.createChild(am4charts.XYChart);
		maleChart.paddingRight = 0;
		maleChart.data = data;
		// Use only absolute numbers
		maleChart.numberFormatter.numberFormat = "#.#s";

		// Create axes
		var maleCategoryAxis = maleChart.yAxes.push(new am4charts.CategoryAxis());
		maleCategoryAxis.dataFields.category = "id";
		maleCategoryAxis.renderer.inversed = true;
		maleCategoryAxis.renderer.minGridDistance = 1;

		var maleValueAxis = maleChart.xAxes.push(new am4charts.ValueAxis());
		maleValueAxis.renderer.inversed = true;
		maleValueAxis.min = 0;
		maleValueAxis.renderer.minGridDistance = 50;

		// Create series
		var maleSeries = maleChart.series.push(new am4charts.ColumnSeries());
		maleSeries.dataFields.valueX = "hin";
		maleSeries.fill = am4core.color("#119C11");
		maleSeries.dataFields.categoryY = "id";
		maleSeries.columns.template.tooltipText = "Zuzug OT {categoryY}: {valueX}";


		var femaleChart = mainContainer.createChild(am4charts.XYChart);
		femaleChart.paddingLeft = 0;
		femaleChart.data = data;
		// Use only absolute numbers
		maleChart.numberFormatter.numberFormat = "#.#s";

		// Create axes
		var femaleCategoryAxis = femaleChart.yAxes.push(new am4charts.CategoryAxis());
		femaleCategoryAxis.renderer.opposite = true;
		femaleCategoryAxis.renderer.inversed = true;
		femaleCategoryAxis.dataFields.category = "id";
		femaleCategoryAxis.renderer.minGridDistance = 1;

		var femaleValueAxis = femaleChart.xAxes.push(new am4charts.ValueAxis());
		femaleValueAxis.min = 0;
		femaleValueAxis.renderer.minGridDistance = 50;

		// Create series
		var femaleSeries = femaleChart.series.push(new am4charts.ColumnSeries());
		femaleSeries.dataFields.valueX = "weg";
		femaleSeries.fill = am4core.color("#ff0000");
		femaleSeries.stroke = femaleSeries.fill;
		femaleSeries.columns.template.tooltipText = "Wegzug OT {categoryY}: {valueX}";
		femaleSeries.dataFields.categoryY = "id";


	}
);