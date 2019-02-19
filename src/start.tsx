import * as React from 'react'
import * as ReactDOM from 'react-dom'
import path from 'path'
import R from 'ramda'
import cubus from 'cubus'
import GridLayout from 'react-grid-layout'
import TabledataView from './view/table/TabledataView'
import MatrixConfigView from './view/table/MatrixConfigView'
import GeodataView from './view/geo/GeodataView'
import ChartsView from './view/charts/ChartsView'
import Geodata from './model/Geodata';
import Tabledata from './model/Tabledata'
import OLAPView from './view/olap/OLAPView'
import Cubus from 'cubus';

interface AppProps {
}

interface AppState {
    geodata: Geodata | null
    tabledatas: { [id:string]: Tabledata}
    selectedTabledataId: string | null        
    rowOffset: number
    columnOffset: number
}

class App extends React.Component<AppProps,AppState>{

    constructor(props:AppProps){
        super(props)
        this.onSelectGeodata = this.onSelectGeodata.bind(this)
        this.onSelectTabledatas = this.onSelectTabledatas.bind(this)
        this.onSelectTabledataId = this.onSelectTabledataId.bind(this)
        this.onSelectRowOffset = this.onSelectRowOffset.bind(this)
        this.onSelectColumnOffset = this.onSelectColumnOffset.bind(this)
        this.state = {
            geodata: null,            
            tabledatas: {},
            selectedTabledataId: null,            
            rowOffset: 0,
            columnOffset: 0            
        }
    }

    onSelectTabledataId(id: string){
        this.setState({selectedTabledataId: id})
    }

    onSelectGeodata(file:File) {
        Geodata.read(file.path,(data:Geodata) => this.setState({geodata:data.transformToWGS84()}))
    }

    onSelectTabledatas(fileList:FileList) {
        for(let i=0;i<fileList.length;i++){
            let file = fileList.item(i)
            if(file!=null){
                Tabledata.read(file.path,(tabledata: Tabledata) => {             
                    this.setState({ tabledatas: R.assoc(path.basename(file!.path),tabledata,this.state.tabledatas) })                                       
                })
            }
        }                  
    }

    onSelectRowOffset(rowOffset: number){                                       
        this.setState({rowOffset: rowOffset})                     
    }

    onSelectColumnOffset(columnOffset: number){                    
        this.setState({columnOffset: columnOffset})            
    }

    private getOffsetTabledatas(tabledatas: { [id:string]: Tabledata}) : { [id:string]: Tabledata} {
        let result = {}
        R.forEach((tableName) => {
            let tableData = this.state.tabledatas[tableName]
            let newTabledata = tableData.getTabledataBy([this.state.rowOffset,tableData.getRowCount()],[this.state.columnOffset,tableData.getColumnCount()])           
            result = R.assoc(tableName,newTabledata,result)      
        }, R.keys(this.state.tabledatas) as string[])
        return result  
    }

    render(){
        let tabledatas = this.getOffsetTabledatas(this.state.tabledatas)
        return <GridLayout className="layout" cols={2} width={1600} rowHeight={600} preventCollision={false}>
            <div key="charts-view"  data-grid={{x: 0, y: 0, w: 1, h: 1}}>
                <ChartsView tabledatas={tabledatas}/>
            </div>
            <div key="tabledata-view" data-grid={{x: 0, y: 1, w: 2, h: 1}}>
                <MatrixConfigView onRowOffsetSelect={this.onSelectRowOffset} onColumnOffsetSelect={this.onSelectColumnOffset}/>                
                <TabledataView geodata={this.state.geodata}
                               tabledatas={tabledatas}
                               geoFieldNames={this.state.geodata==null?[]:this.state.geodata.fields()} 
                               onSelectTabledataId={this.onSelectTabledataId}
                               onSelectTabledataFiles={this.onSelectTabledatas}/>
            </div>
            <div key="geodata-view" data-grid={{x: 1, y: 0, w: 1, h: 1}}>
                <GeodataView geodata={this.state.geodata} onSelectGeodata={this.onSelectGeodata}/>
            </div>    
        </GridLayout>
    }
}

//ReactDOM.render(<App/>,document.getElementById('root'))
let createExampleCubus = (): cubus<number> => {
    let dimensions = ['Jahr','Von','Nach']
    let cube = new Cubus<number>(dimensions)
    
    cube.addDimensionValue('Jahr','2015')
    cube.addDimensionValue('Jahr','2016')
    cube.addDimensionValue('Jahr','2017')

    cube.addDimensionValue('Von','10000')
    cube.addDimensionValue('Von','10001')
    cube.addDimensionValue('Von','10002')

    cube.addDimensionValue('Nach','10000')
    cube.addDimensionValue('Nach','10001')
    cube.addDimensionValue('Nach','10002')
    // - Add data -
    // 2015
    cube.add(29,{'Jahr':'2015','Von':'10000','Nach':'10000'})
    cube.add(4, {'Jahr':'2015','Von':'10000','Nach':'10001'})
    cube.add(28,{'Jahr':'2015','Von':'10000','Nach':'10002'})
    cube.add(4, {'Jahr':'2015','Von':'10001','Nach':'10000'})
    cube.add(46,{'Jahr':'2015','Von':'10001','Nach':'10001'})
    cube.add(24,{'Jahr':'2015','Von':'10001','Nach':'10002'})
    cube.add(13,{'Jahr':'2015','Von':'10002','Nach':'10000'})
    cube.add(46,{'Jahr':'2015','Von':'10002','Nach':'10001'})
    cube.add(470,{'Jahr':'2015','Von':'10002','Nach':'10002'})
    // 2016
    cube.add(28,{'Jahr':'2016','Von':'10000','Nach':'10000'})
    cube.add(8, {'Jahr':'2016','Von':'10000','Nach':'10001'})
    cube.add(61,{'Jahr':'2016','Von':'10000','Nach':'10002'})
    cube.add(5, {'Jahr':'2016','Von':'10001','Nach':'10000'})
    cube.add(40,{'Jahr':'2016','Von':'10001','Nach':'10001'})
    cube.add(38,{'Jahr':'2016','Von':'10001','Nach':'10002'})
    cube.add(16,{'Jahr':'2016','Von':'10002','Nach':'10000'})
    cube.add(39,{'Jahr':'2016','Von':'10002','Nach':'10001'})
    cube.add(735,{'Jahr':'2016','Von':'10002','Nach':'10002'})
    // 2017
    cube.add(17,{'Jahr':'2017','Von':'10000','Nach':'10000'})
    cube.add(13, {'Jahr':'2017','Von':'10000','Nach':'10001'})
    cube.add(16,{'Jahr':'2017','Von':'10000','Nach':'10002'})
    cube.add(4, {'Jahr':'2017','Von':'10001','Nach':'10000'})
    cube.add(62,{'Jahr':'2017','Von':'10001','Nach':'10001'})
    cube.add(31,{'Jahr':'2017','Von':'10001','Nach':'10002'})
    cube.add(18,{'Jahr':'2017','Von':'10002','Nach':'10000'})
    cube.add(44,{'Jahr':'2017','Von':'10002','Nach':'10001'})
    cube.add(552,{'Jahr':'2017','Von':'10002','Nach':'10002'})
    return cube
}
Geodata.read('./testdata/ot.shp',(geodata:Geodata) => {
    ReactDOM.render(<OLAPView geodata={geodata} cubus={createExampleCubus()}/>,document.getElementById('root'))
})

//TODO: 18.02.2019 - 22.02.2019
// [✓] Link geodata attributes for ALL matrices
// [✓] Add offset selectors for row and column
// [ ] Use OLAP and Geodata as main data structure
// [ ] Model aggregation of *ranges: Sum //
// [ ] Model difference of *ranges: diff of year values (time)
// [ ] Model Index attributes: Example -> Move persons to all persons 
// [ ] Model grouping for theme, time and spatial ranges
