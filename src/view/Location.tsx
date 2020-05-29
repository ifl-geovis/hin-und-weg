import { Panel } from "primereact/panel";
import * as React from "react";
import { Accordion, AccordionTab } from 'primereact/accordion';
import SelectInput from "./input/SelectInput";

export interface ILocationProps
{
  title: string;
  locations: string[];
  selectedLocation: string | null;
  onSelectLocation: (newLocation: string) => void;
}

export default class Location extends React.Component<ILocationProps>
{

  constructor(props: ILocationProps)
  {
    super(props);
  }

  public render(): JSX.Element
  {
    return (
      <Accordion activeIndex={0}>
        <AccordionTab header={this.props.title}>
          <SelectInput options={this.props.locations} selected={this.props.selectedLocation} onSelected={this.props.onSelectLocation}/>
        </AccordionTab>
      </Accordion>
    );
  }

}
