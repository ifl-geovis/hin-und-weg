import { Checkbox } from "primereact/checkbox";
import { Panel } from "primereact/panel";
import R from "ramda";
import * as React from "react";

export interface IYearsProps {
    availableYears: string[];
    selected: string[];
    setYears: (newYears: string[]) => void;
}

export default class Years extends React.Component<IYearsProps> {

    constructor(props: IYearsProps) {
        super(props);
        this.onYearsChange = this.onYearsChange.bind(this);
        this.makeCheckBox = this.makeCheckBox.bind(this);
    }

    public render(): JSX.Element {
        const checkboxes = R.map(this.makeCheckBox, this.props.availableYears.sort());
        return (
            <Panel header="Jahr(e)">
                <div className="p-grid" style={{ margin: "10px" }}>
                    {checkboxes}
                </div>
            </Panel>
        );
    }

    private makeCheckBox(year: string){
        return (
            <div key={year} className="p-col-12">
                <Checkbox inputId={year} value={year}
                          onChange={this.onYearsChange} checked={R.includes(year, this.props.selected)}></Checkbox>
                <label htmlFor="cb-{year}" className="p-checkbox-label">{year}</label>
            </div>
        );
    }

    private onYearsChange(e: { originalEvent: Event, value: string, checked: boolean}) {
        let selectedYears = this.props.selected;
        const selectedYear = e.value;
        if (e.checked) {
            selectedYears = R.append(selectedYear, selectedYears);
        } else {
            selectedYears = R.reject(R.equals(selectedYear), selectedYears);
        }
        this.props.setYears(R.uniq(selectedYears));
    }

}
