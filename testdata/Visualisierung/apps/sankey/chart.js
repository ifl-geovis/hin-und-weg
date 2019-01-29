require(["vendor/amcharts4/core", "vendor/amcharts4/charts", 'vendor/amcharts4/themes/animated', 'sankey/weighted-tupels', 'sankey/colors'],
	function (am4core, am4charts, am4themes_animated, data, colors) {

		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		let chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
		chart.hiddenState.properties.opacity = 0;

		let linkTemplate = chart.links.template;
		linkTemplate.fillOpacity = 1;

		chart.data = data.map(function (item) {
			return {
				"from": "F" + item.from,
				"to": "T" + item.to,
				"value": item.value,
				"nodeColor": colors[parseInt(item.from)]
			}
		}).filter(function (item) {
			return item.value > 180;
		});

		let hoverState = chart.links.template.states.create("hover");
		hoverState.properties.fillOpacity = 0.6;

		chart.dataFields.fromName = "from";
		chart.dataFields.toName = "to";
		chart.dataFields.value = "value";
		chart.dataFields.color = "nodeColor";

		// for right-most label to fit
		chart.paddingRight = 30;

		// make nodes draggable
		let nodeTemplate = chart.nodes.template;
		nodeTemplate.inert = true;
		nodeTemplate.readerTitle = "Drag me!";
		nodeTemplate.showSystemTooltip = true;
		nodeTemplate.width = 20;
		nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
		nodeTemplate.showSystemTooltip = true;
		nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;

	}
);