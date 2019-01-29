require(["vendor/amcharts4/core", "vendor/amcharts4/charts", 'vendor/amcharts4/themes/animated', 'chord-all-to-all/weighted-tupels', 'chord-all-to-all/colors'],
	function (am4core, am4charts, am4themes_animated, data, colors) {


		// Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		let chart = am4core.create("chartdiv", am4charts.ChordDiagram);
		chart.hiddenState.properties.opacity = 0;
		//chart.innerRadius = am4core.percent(80);

		let link = chart.links.template;
		link.fillOpacity = 1;

		let slice = chart.nodes.template.slice;
		slice.stroke = am4core.color("#000");
		slice.strokeOpacity = 1;
		slice.strokeWidth = 0;

		chart.data = data.map(function(item){
			return {
				"from" : item.from,
				"to" : item.to,
				"value" : item.value,
				"nodeColor" : colors[parseInt(item.from)]
			}
		}).filter(function(item){
			return item.value > 180;
		});


		chart.dataFields.fromName = "from";
		chart.dataFields.toName = "to";
		chart.dataFields.value = "value";
		chart.dataFields.color = "nodeColor";

		// make nodes draggable
		var nodeTemplate = chart.nodes.template;
		nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
		nodeTemplate.showSystemTooltip = true;
		nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer

	}
);