import { Dropdown } from "primereact/dropdown";
import React from "react";

export interface ISelectInputProps {
    options: string[];
    selected?: string|null;
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
            <Dropdown value={this.props.selected} options={options} onChange={this.onSelected} />
        );
    }

    private onSelected(event: { originalEvent: Event, value: any}) {
        this.props.onSelected(event.value);
    }
}
