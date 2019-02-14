import React, { Component } from "react"
import R from "ramda"
import { Map, GeoJSON,Marker } from 'react-leaflet'
import { FeatureCollection, Geometry } from "geojson"
import { FileInput , Card, Elevation} from '@blueprintjs/core'
import { Cell, Column, Table} from '@blueprintjs/table'
import { Flex, Box} from 'reflexbox'
import Geodata from '../model/Geodata'

interface IFeaturesProps {   
}

interface IFeaturesState {
    features: FeatureCollection<Geometry> | null
    title: string
}

export class GeodataMap extends Component<IFeaturesProps,IFeaturesState> {
    
    constructor(props: IFeaturesProps){
        super(props)
        this.state = { features: null, title: ""}        
    }

    handleFile(event: React.ChangeEvent<HTMLInputElement>) {
        if(event.target.files !=null && event.target.files.length > 0){
            var file = event.target.files[0]
            Geodata.read(file.path,(data:Geodata) => {
                this.setState({features: data.transformToWGS84().featureCollection, title:  file.path})
            })           
        }   
    }    
    
    render(): JSX.Element {
        if(this.state.features!=null){
            let features = this.state.features.features
            let firstFeature = R.head(features)
            var columnNames:string[]=[]
            var columns:any = null
            if(firstFeature){
                let cellRenderer = (rowNum: number, colNum: number) => {
                    let feature = R.nth(rowNum,features)
                    let key = R.nth(colNum,columnNames)
                    if(feature!=undefined && feature.properties!=null && key!=undefined){
                        return <Cell>{R.prop(key,feature.properties)}</Cell>
                    }else{
                        return <Cell></Cell>
                    }
                }
                let createColumn = (column:string) => {
                    return <Column key={column} name={column} cellRenderer={cellRenderer}/>
                }
                columnNames = R.keys(firstFeature.properties) as string[]
                columns = R.map(createColumn,columnNames)
            }                             
            return (
                <Box>
                    <Card elevation={Elevation.ONE}>
                    <Flex px={2}>                               
                        <FileInput disabled={false} text="Shape Datei aufrufen ..." onInputChange={this.handleFile.bind(this)} />
                    </Flex>
                    <Flex>
                        <Box w={1/2} px={2}>
                            <h3>Geometrien</h3>
                        </Box>
                        <Box px={2}>
                            <h3>Attribute</h3>  
                        </Box>          
                    </Flex>    
                    <Flex px={2} py={2}>
                        <Box w={1/2} px={2} py={2}>
                            <Map ref='map' center={[51.34,12.37]} zoom={10} style={{height: "300px",width: "300px"}}>
                                <GeoJSON data={this.state.features} key={this.state.title} />                                                           
                            </Map>
                        </Box>
                        <Box px={2} py={2}>
                            <Table numRows={features.length}>
                                {columns}
                            </Table>     
                        </Box>          
                    </Flex>   
                    </Card>                  
                </Box>
            )
        }else{
            return (                
                <Box px={2}>             
                    <Card elevation={Elevation.TWO}>                         
                        <FileInput disabled={false} fill={true} text="Shape Datei aufrufen ..." onInputChange={this.handleFile.bind(this)} />
                    </Card>
                </Box>
            )
        }
      }

}