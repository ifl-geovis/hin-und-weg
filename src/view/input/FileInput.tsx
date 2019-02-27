import { FileInput as BlueFileInput} from "@blueprintjs/core";
import React from "react";

export interface IFileInputProps {
   label: string;
   filesSelected: (files: FileList) => void;
   disabled: boolean;
}

export default class FileInput extends React.Component<IFileInputProps>{

    constructor(props: IFileInputProps){
        super(props);
        this.handleFiles = this.handleFiles.bind(this);
    }

    public render(): JSX.Element {
       return (
            <div>
                <BlueFileInput disabled={this.props.disabled}
                               text={this.props.label}
                               onInputChange={this.handleFiles}
                               inputProps={{multiple: true}}/>
            </div>
       );
    }

    private handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files != null && event.target.files.length > 0) {
            this.props.filesSelected(event.target.files);
        }
    }

}
