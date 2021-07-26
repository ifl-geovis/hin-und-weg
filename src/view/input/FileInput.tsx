import { FileUpload } from 'primereact/fileupload';
import React from 'react';

export interface IFileInputProps {
	label: string;
	filesSelected: (files: FileList) => void;
	disabled: boolean;
	accept: string;
}

export default class FileInput extends React.Component<IFileInputProps> {

	constructor(props: IFileInputProps) {
		super(props);
		this.handleFiles = this.handleFiles.bind(this);
	}

	public render(): JSX.Element {
		return <FileUpload mode="basic" disabled={this.props.disabled} chooseLabel={this.props.label} multiple={true} onSelect={this.handleFiles} accept={this.props.accept} />;
	}

	private handleFiles(event: { originalEvent: Event; files: any }) {
		this.props.filesSelected(event.files);
	}
}
