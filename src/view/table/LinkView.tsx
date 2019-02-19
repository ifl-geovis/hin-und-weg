import R from 'ramda'
import React from 'react'
import { HTMLSelect } from '@blueprintjs/core'

export interface LinkViewProps {
    fieldNames: string[]    
    idField: string
    nameField: string
    onNameSelect: (name:string) => void
    onIdSelect: (id:string) => void
}

export default class MatrixView extends React.Component<LinkViewProps>{

    constructor(props: LinkViewProps){
        super(props)
        this.onLabelSelect = this.onLabelSelect.bind(this)
        this.onIdSelect = this.onIdSelect.bind(this)       
    }

    private onLabelSelect(event: React.ChangeEvent<HTMLSelectElement>){
        let selected = event.target.options[event.target.selectedIndex].value
        this.props.onNameSelect(selected)                        
    }
   
    private onIdSelect(event: React.ChangeEvent<HTMLSelectElement>){
        let selected = event.target.options[event.target.selectedIndex].value
        this.props.onIdSelect(selected)        
    }

    public render():JSX.Element{       
       return (
        <div>
            <label>Feld als Name für Spalten und Zeilen:</label><HTMLSelect options={this.props.fieldNames} onChange={this.onLabelSelect} value={this.props.nameField}/>
            &nbsp;<label>Feld für Schlüssel zu Spalten und Zeilen:</label><HTMLSelect options={this.props.fieldNames} onChange={this.onIdSelect} value={this.props.idField}/>
        </div>   
       ) 
    }

}