import React from 'react'
import R from 'ramda'
import { GeoJsonProperties } from 'geojson'
import { Table, Column,Cell } from '@blueprintjs/table';

export interface AttributeViewProps {
    attributes: GeoJsonProperties[]
}

export default class AttributeView extends React.Component<AttributeViewProps>{
    
    constructor(props:AttributeViewProps){
        super(props)                  
    }      
    public render():JSX.Element{       
        if(R.isEmpty(this.props.attributes)) return <div></div>                
        let createColumn = ((name: string) => {
            return <Column key={name} name={name} cellRenderer={(i:number) => <Cell>{this.props.attributes[i]![name]}</Cell>}></Column>
        })
        let firstAttributes:GeoJsonProperties = R.head(this.props.attributes)!
        let columns = R.map(createColumn,R.keys(firstAttributes) as string[])
       return (
            <div style={{width:"500px", height:"200px", overflow:'auto'}}>
                <Table numRows={this.props.attributes.length}>
                    {columns}
                </Table>
            </div>   
       ) 
    }
  }