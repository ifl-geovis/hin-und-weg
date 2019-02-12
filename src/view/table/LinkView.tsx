import React from 'react'
import { HTMLSelect } from '@blueprintjs/core'

export interface LinkViewProps {
    fieldNames: string[]
    onLabelSelect: (label:string) => void
    onIdSelect: (id:string) => void
}

export default class MatrixView extends React.Component<LinkViewProps>{

    constructor(props: LinkViewProps){
        super(props)
        this.onLabelSelect = this.onLabelSelect.bind(this)
        this.onIdSelect = this.onIdSelect.bind(this)
    }

    private onLabelSelect(event: React.ChangeEvent<HTMLSelectElement>){
        this.props.onLabelSelect(event.target.options[event.target.selectedIndex].value)        
    }
   
    private onIdSelect(event: React.ChangeEvent<HTMLSelectElement>){
        this.props.onIdSelect(event.target.options[event.target.selectedIndex].value)
    }

    public render():JSX.Element{
       return (
        <div>
            <div><label>Name:</label><HTMLSelect options={this.props.fieldNames} onChange={this.onLabelSelect}/></div>
            <div><label>Id:</label><HTMLSelect options={this.props.fieldNames} onChange={this.onIdSelect}/></div>
        </div>   
       ) 
    }

}