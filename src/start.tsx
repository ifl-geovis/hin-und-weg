/// <reference path="../node_modules/alasql/dist/alasql.d.ts" />
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Flex, Box} from 'reflexbox'
import { Checkbox,Card,Elevation } from '@blueprintjs/core'
// HUW software
import { SystemInfo } from './components/SystemInfo'
//import { GeodataMap } from './components/Map'
import { D3Map } from './components/d3Map'
import { MatrixUI } from './components/Matrix'
import RGL, { WidthProvider} from 'react-grid-layout'
import { on } from './debug';

let ReactGridLayout = WidthProvider(RGL)
let layout = [
    {i: 'info', x:0, y:0, w: 6, h:2},
    {i: 'matrix',x: 0,y: 1,w:6, h:5},
    {i: 'map', x:6, y:1, w:6 , h:5}
]
ReactDOM.render(
    
    <ReactGridLayout layout={layout} rowHeight={100}>
        <div key="info"><SystemInfo version="0.0.2"/></div>
        <div key="matrix"><MatrixUI/></div>
        <div key="map"><D3Map/></div>
    </ReactGridLayout>
,document.getElementById("root"))
/*
ReactDOM.render( <div>
    <Flex p={1} m={1}>
        <Box w={1/2} m={1}><SystemInfo version="0.0.1"/></Box>        
    </Flex>
    <Flex p={1} m={1}>
        <Box w={1/2} m={1}><MatrixUI/></Box>
        <Box w={1/2} m={1}><D3Map/></Box>    
    </Flex>
</div>,document.getElementById("root"))
*/