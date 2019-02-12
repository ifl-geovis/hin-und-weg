import R from 'ramda'
import React from 'react'
import { Tab, Tabs } from "@blueprintjs/core"
import MatrixView from './MatrixView';

export interface TabMatrixViewProps {

}

export default class TabMatrixView extends React.Component<TabMatrixViewProps> {

    constructor(props:TabMatrixViewProps){
        super(props)
    }

    handleTabChange(newTabId: string | number, prevTabId: string | number, event: React.MouseEvent<HTMLElement, MouseEvent>){
        console.log("handleTabChange")
    }

    render(){
        let createTab = (name:string):JSX.Element => {
            return <Tab key={name} id={name} title={"Matrix "+name} panel={<MatrixView/>}/>
        }                
        return <Tabs id="TabMatrix" onChange={this.handleTabChange}>
            {R.map(createTab,R.map(R.toString,R.range(2001,2018)))}                 
        </Tabs>
    }
}
