
import React from "react";
import Select from "react-select";

export interface IMultiSelectInputProps {
    options: string[];
    onSelected: (selected: string[]) => void;
}

export default class MultiSelectInput extends React.Component<IMultiSelectInputProps> {

    constructor(props: IMultiSelectInputProps) {
        super(props);
        this.onSelected = this.onSelected.bind(this);
    }

    public render(): JSX.Element {
        const options = this.props.options.map((option: string) => {
            return { value: option, label: option};
        });
        return (
            <Select options={options} onChange={this.onSelected} isMulti={true}/>
        );
    }

    private onSelected(selected: any) {
        const selectedValues = selected as Array<{[value: string]: string}>;
        const newSelectedValues = selectedValues.map((selectedValue) => selectedValue.value);
        this.props.onSelected(newSelectedValues);
    }
}
