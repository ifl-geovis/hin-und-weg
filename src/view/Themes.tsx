import { Panel } from "primereact/panel";
import { RadioButton } from "primereact/radiobutton";
import R from "ramda";
import * as React from "react";

export interface IThemesProps {
    selected: string;
    setTheme: (theme: string) => void;
    themes: string[];
}

export default class Themes extends React.Component<IThemesProps> {

    constructor(props: IThemesProps) {
        super(props);
        this.makeRadioButton = this.makeRadioButton.bind(this);
    }

    public render(): JSX.Element {
        const radioButtons = R.map(this.makeRadioButton, this.props.themes);
        return (
            <Panel header="Thema">
                <div className="p-grid" style={{ margin: "10px" }}>
                    {radioButtons}
                </div>
            </Panel>
        );
    }

    private makeRadioButton(theme: string): JSX.Element {
        return (
            <div key={theme} className="p-col-12">
                <RadioButton inputId={theme} name="theme" value={theme}
                             onChange={(e) => this.props.setTheme(e.value)} checked={this.props.selected === theme} />
                <label htmlFor={theme} className="p-radiobutton-label">{theme}</label>
            </div>
        );
    }

}
