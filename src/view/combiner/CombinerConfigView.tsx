import React from "react";
import Combiner from "../../model/Combiner";
import FileInput from "../input/FileInput";
import MultiSelectInput from "../input/MultiSelectInput";
import SelectInput from "../input/SelectInput";

export interface ICombinerConfigViewProps {
    combiner: Combiner;
    onAddTabledatas: (files: FileList) => void;
    onSelectYears: (years: string[]) => void;
    onSelectFroms: (froms: string[]) => void;
    onSelectTos: (tos: string[]) => void;
    onSelectGeoId: (geoId: string) => void;
    onSelectGeoName: (geoName: string) => void;
}

export default class ChartConfigView extends React.Component<ICombinerConfigViewProps> {

    constructor(props: ICombinerConfigViewProps) {
        super(props);
    }

    public render(): JSX.Element {
        const combiner = this.props.combiner;
        const geodataFields = combiner.getGeodata() ? combiner.getGeodata().fields() : [];
        const yearsOptions = combiner.getTableNames();
        const fromOptions = combiner.getRowNamesFor(yearsOptions[0]);
        const toOptions = combiner.getColumnNamesFor(yearsOptions[0]);
        return (
            <div>
                <FileInput label={"Tabellendaten hinzufügen..."} filesSelected={this.props.onAddTabledatas} disabled={false}/>
                <div> GeodatenId: <SelectInput options={geodataFields} onSelected={this.props.onSelectGeoId}/></div>
                <div> GeodatenName: <SelectInput options={geodataFields} onSelected={this.props.onSelectGeoName}/></div>
                <div> Jahre: <MultiSelectInput options={yearsOptions} onSelected={this.props.onSelectYears} /></div>
                <div> Von:   <MultiSelectInput options={fromOptions}  onSelected={this.props.onSelectFroms} /></div>
                <div> Nach:  <MultiSelectInput options={toOptions}    onSelected={this.props.onSelectTos} /></div>
            </div>
       );
    }
  }
