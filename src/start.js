"use strict";
exports.__esModule = true;
/// <reference path="../node_modules/alasql/dist/alasql.d.ts" />
var React = require("react");
var ReactDOM = require("react-dom");
var reflexbox_1 = require("reflexbox");
var core_1 = require("@blueprintjs/core");
// HUW software
var SystemInfo_1 = require("./components/SystemInfo");
var Map_1 = require("./components/Map");
var Matrix_1 = require("./components/Matrix");
ReactDOM.render(<div>
    <reflexbox_1.Flex p={1} m={1}>
        <reflexbox_1.Box w={1 / 2} m={1}><SystemInfo_1.SystemInfo version="0.0.1"/></reflexbox_1.Box>
        <reflexbox_1.Box w={1 / 2} m={1}><core_1.Card elevation={core_1.Elevation.TWO}>
            <h3>TODO:</h3>
            <core_1.Checkbox>Modell zum Kombinieren der Datenquellen</core_1.Checkbox>
            <core_1.Checkbox>Anwendungslayout</core_1.Checkbox>           
        </core_1.Card></reflexbox_1.Box>
    </reflexbox_1.Flex>
    <reflexbox_1.Flex p={1} m={1}>
        <reflexbox_1.Box w={1 / 2} m={1}><Matrix_1.MatrixUI /></reflexbox_1.Box>
        <reflexbox_1.Box w={1 / 2} m={1}><Map_1.GeodataMap /></reflexbox_1.Box>    
    </reflexbox_1.Flex>
</div>, document.getElementById("root"));
