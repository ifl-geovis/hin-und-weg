import R from 'ramda'
import React from 'react'
import { Tab, Tabs } from "@blueprintjs/core"
import MatrixView from './MatrixView';
import Tabledata from '../../model/Tabledata'
import Geodata from '../../model/Geodata'

export interface TabMatrixViewProps {
    geodata: Geodata | null
    fieldNames: string[]
    tabledatas:  { [name:string]: Tabledata }
    onSelectTableDataId: (selectedTabledataId:string)=> void
}

export default class TabMatrixView extends React.Component<TabMatrixViewProps> {

    constructor(props:TabMatrixViewProps){
        super(props)
        this.handleTabChange = this.handleTabChange.bind(this)
    }

    handleTabChange(selectedTabId: string){
        this.props.onSelectTableDataId(selectedTabId)
    }

    render(){
        let tabledataIds = Object.keys(this.props.tabledatas)
        let createTab = (name:string):JSX.Element => {
            return <Tab key={name} id={name} title={"Matrix "+name} 
                panel={<MatrixView 
                        geodata={this.props.geodata}
                        tabledata={this.props.tabledatas[name]} 
                        fields={this.props.fieldNames} 
                        onIdSelect={console.log} 
                        onLabelSelect={console.log}/>}
            />
        }                
        return <Tabs id="TabMatrix" onChange={this.handleTabChange}>
            {R.map(createTab,tabledataIds)}                 
        </Tabs>
    }
}
