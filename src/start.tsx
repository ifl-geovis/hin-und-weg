/// <reference path="../node_modules/alasql/dist/alasql.d.ts" />
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Flex, Box} from 'reflexbox'
import { Checkbox,Card,Elevation } from '@blueprintjs/core'
// HUW software
import { SystemInfo } from './components/SystemInfo'
import { GeodataMap } from './components/Map'
//import { D3Map } from './components/d3Map'
import { MatrixUI } from './components/Matrix'

ReactDOM.render( <div>
    <Flex p={1} m={1}>
        <Box w={1/2} m={1}><SystemInfo version="0.0.1"/></Box>        
    </Flex>
    <Flex p={1} m={1}>
        <Box w={1/2} m={1}><MatrixUI/></Box>
        <Box w={1/2} m={1}><GeodataMap/></Box>    
    </Flex>
</div>,document.getElementById("root"))