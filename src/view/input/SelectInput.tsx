import { Dropdown } from "primereact/dropdown";
import React from "react";

export interface ISelectInputProps {
    options: string[];
    onSelected: (selected: string) => void;
}

interface ISelectInputState {
    selected: string;
}

export default class SelectInput extends React.Component<ISelectInputProps, ISelectInputState> {

    constructor(props: ISelectInputProps) {
        super(props);
        this.onSelected = this.onSelected.bind(this);
        this.state = {
            selected: "",
        };
    }

    public render(): JSX.Element {
        const options = this.props.options.map((option: string) => {
            return { value: option, label: option};
        });
        return (
            <Dropdown value={this.state.selected} options={options} onChange={this.onSelected} />
        );
    }

    private onSelected(event: { originalEvent: Event, value: any}) {
        this.props.onSelected(event.value);
        this.setState({selected: event.value});
    }
}
