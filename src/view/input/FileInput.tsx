import React from "react"
import { FileInput as BlueFileInput} from "@blueprintjs/core"

export interface FileInputProps {
   label: string
   filesSelected: (files:FileList) => void 
   disabled: boolean 
}

export default class FileInput extends React.Component<FileInputProps>{
    
    constructor(props:FileInputProps){
        super(props)
        this.handleFiles = this.handleFiles.bind(this)
    }

    private handleFiles(event:React.ChangeEvent<HTMLInputElement>){
        if(event.target.files !=null && event.target.files.length > 0){
            this.props.filesSelected(event.target.files)
        }   
    }

    public render():JSX.Element{
       return (
        <div>
            <BlueFileInput disabled={this.props.disabled} text={this.props.label} onInputChange={this.handleFiles} inputProps={{multiple: true}}/>
        </div>        
       ) 
    }
  }