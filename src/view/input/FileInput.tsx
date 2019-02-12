import React from "react"
import { FileInput as BlueFileInput} from "@blueprintjs/core"

export interface FileInputProps {
   label: string
   fileSelected: (file:File) => void 
   disabled: boolean 
}

export default class FileInput extends React.Component<FileInputProps>{
    
    constructor(props:FileInputProps){
        super(props)
        this.handleFile = this.handleFile.bind(this)
    }

    private handleFile(event:React.ChangeEvent<HTMLInputElement>){
        if(event.target.files !=null && event.target.files.length > 0){
            this.props.fileSelected(event.target.files[0])
        }   
    }

    public render():JSX.Element{
       return (
        <div>
            <BlueFileInput disabled={this.props.disabled} text={this.props.label} onInputChange={this.handleFile} />
        </div>        
       ) 
    }
  }