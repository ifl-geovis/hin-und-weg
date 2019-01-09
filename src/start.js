"use strict";
exports.__esModule = true;
var React = require("react");
var ReactDOM = require("react-dom");
var SystemInfo_1 = require("./components/SystemInfo");
var Map_1 = require("./components/Map");
require("./start.css");
/*
import 'primereact/resources/themes/nova-light/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
*/
var shapefile = require("shapefile");
var proj4 = require("proj4");
var Matrix_1 = require("./components/Matrix");
//let proj4defs = require("epsg")
//proj4defs(proj4)
shapefile.read("./testdata/ot_wgs84.shp").then(function (features) {
    proj4.defs('EPSG:3006', '+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    console.log(proj4.Proj('EPSG:3006'));
    ReactDOM.render(<div><SystemInfo_1["default"] /><Matrix_1["default"]></Matrix_1["default"]><Map_1.GeodataMap features={features}/></div>, document.getElementById("root"));
});
