import R from 'ramda'
import React from 'react'
import { Tab, Tabs } from "@blueprintjs/core"
import MatrixView from './MatrixView';
import Tabledata from '../../model/Tabledata'
import Geodata from '../../model/Geodata'

export interface TabMatrixViewProps {
    idField: string | null
    nameField: string | null
    geodata: Geodata | null
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
        if(this.props.tabledatas){
            let tabledataIds = Object.keys(this.props.tabledatas)           
            let createTab = (name:string):JSX.Element => {
                let panel = <MatrixView idField={this.props.idField} nameField={this.props.nameField} geodata={this.props.geodata} tabledata={this.props.tabledatas[name]}/>
                return <Tab key={name} id={name} title={"Matrix "+name} panel={panel}/>
            }                
            return (
            <Tabs id="TabMatrix" onChange={this.handleTabChange}>
                {R.map(createTab,tabledataIds)}                 
            </Tabs>
            )
        }
        return <div><p>Keine Matrizen geladen.</p></div>
    }
}
