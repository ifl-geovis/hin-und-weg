import React from "react";
import Select from "react-select";

export interface ISelectInputProps {
    options: string[];
    onSelected: (selected: string) => void;
}

export default class SelectInput extends React.Component<ISelectInputProps> {

    constructor(props: ISelectInputProps) {
        super(props);
        this.onSelected = this.onSelected.bind(this);
    }

    public render(): JSX.Element {
        const options = this.props.options.map((option: string) => {
            return { value: option, label: option};
        });
        return (
            <Select options={options} onChange={this.onSelected} isMulti={false}/>
        );
    }

    private onSelected(selected: any) {
        const selectedValue = selected as {[value: string]: string};
        this.props.onSelected(selectedValue.value);
    }
}
