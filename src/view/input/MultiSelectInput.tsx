import {MultiSelect} from "primereact/multiselect";
import React from "react";

export interface IMultiSelectInputProps {
    options: string[];
    onSelected: (selected: string[]) => void;
}

interface IMultiSelectInputState {
    selected: string[];
}

export default class MultiSelectInput extends React.Component<IMultiSelectInputProps,IMultiSelectInputState> {

    constructor(props: IMultiSelectInputProps) {
        super(props);
        this.onSelected = this.onSelected.bind(this);
        this.state = {
            selected: [],
        };
    }

    public render(): JSX.Element {
        const options = this.props.options.map((option: string) => {
            return { value: option, label: option};
        });
        return (
            <MultiSelect value={this.state.selected} options={options} onChange={this.onSelected}/>
        );
    }

    private onSelected(event: { originalEvent: Event, value: any}) {
        const selectedValues = event.value as string[];
        this.setState({selected: selectedValues});
        this.props.onSelected(selectedValues);
    }
}
