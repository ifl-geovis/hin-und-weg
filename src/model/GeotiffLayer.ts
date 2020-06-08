import React, { Component } from 'react';
// @ts-ignore
import { withLeaflet, MapLayer } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet-geotiff';
import 'leaflet-geotiff/leaflet-geotiff-plotty';
import 'leaflet-geotiff/leaflet-geotiff-vector-arrows';

export class GeotiffLayer extends MapLayer {
	// @ts-ignore
	createLeafletElement(props) {
		const { url, options } = props;
		// @ts-ignore
		return L.leafletGeotiff(url, options);
	}

	componentDidMount() {
		// @ts-ignore
		const { map } = this.props.leaflet;
		// @ts-ignore
		this.leafletElement.addTo(map);
	}
}

// export const PlottyGeotiffLayer = withLeaflet((props) => {
// 	const { options, layerRef } = props;
// 	options.renderer = new L.LeafletGeotiff.Plotty(options);
// 	return <GeotiffLayer ref={layerRef} {...props} />;
// });

// export const VectorArrowsGeotiffLayer = withLeaflet((props) => {
// 	const { options, layerRef } = props;
// 	options.renderer = new L.LeafletGeotiff.VectorArrows(options);
// 	return <GeotiffLayer ref={layerRef} {...props} />;
// });
