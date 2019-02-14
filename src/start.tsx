import * as React from 'react'
import * as ReactDOM from 'react-dom'
import path from 'path'
import R from 'ramda'
import GridLayout from 'react-grid-layout'
import TabledataView from './view/table/TabledataView'
import GeodataView from './view/geo/GeodataView'
import ChartsView from './view/charts/ChartsView'
import Geodata from './model/Geodata';
import Tabledata from './model/Tabledata'
import Combiner from './model/Combiner'

interface AppProps {
}

interface AppState {
    geodata: Geodata | null
    tabledatas: { [id:string]: Tabledata}
    selectedTabledataId: string | null
    combiner: Combiner | null
}

class App extends React.Component<AppProps,AppState>{

    constructor(props:AppProps){
        super(props)
        this.onSelectGeodata = this.onSelectGeodata.bind(this)
        this.onSelectTabledata = this.onSelectTabledata.bind(this)
        this.onSelectTabledataId = this.onSelectTabledataId.bind(this)
        this.state = {
            geodata: null,
            tabledatas: {},
            selectedTabledataId: null,
            combiner: null
        }
    }

    onSelectTabledataId(id: string){
        this.setState({selectedTabledataId: id})
    }

    onSelectGeodata(file:File) {
        Geodata.read(file.path,(data:Geodata) => this.setState({geodata:data.transformToWGS84()}))
    }

    onSelectTabledata(file:File) {
        Tabledata.read(file.path,(tabledata: Tabledata) => { 
            let newTabledata = tabledata.getTabledataBy([2,tabledata.getRowCount()],[0,tabledata.getColumnCount()])           
            this.setState({ tabledatas: R.assoc(path.basename(file.path),newTabledata,this.state.tabledatas) })
            
        })
    }

    render(){
        return <GridLayout className="layout" cols={2} width={1600} rowHeight={600} preventCollision={false}>
            <div key="charts-view"  data-grid={{x: 0, y: 0, w: 1, h: 1}}>
                <ChartsView tabledatas={this.state.tabledatas}/>
            </div>
            <div key="tabledata-view" data-grid={{x: 0, y: 1, w: 2, h: 1}}>
                <TabledataView  geodata={this.state.geodata}
                                tabledatas={this.state.tabledatas}
                               geoFieldNames={this.state.geodata==null?[]:this.state.geodata.fields()} 
                               onSelectTabledataId={this.onSelectTabledataId}
                               onSelectTabledataFile={this.onSelectTabledata}/>
            </div>
            <div key="geodata-view" data-grid={{x: 1, y: 0, w: 1, h: 1}}>
                <GeodataView geodata={this.state.geodata} onSelectGeodata={this.onSelectGeodata}/>
            </div>    
        </GridLayout>
    }
}

ReactDOM.render(<App/>,document.getElementById('root'))
