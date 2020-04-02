import * as React from "react";

import Config from "../config";

export default class ProjektInfo extends React.Component<{}, {}>
{

	public render(): JSX.Element
	{
        return (<div>
            <h3>Hin und Weg Projekt Informationen</h3> <hr></hr>

            <div>
                Hin & Weg ist eine Anwendung zur Visualisierung von Umzugsbewegungen in der Stadt Hannover. <br></br>
                In Auftrag gegeben wurde das Projekt vom Institut für Länderkunde und entwickelt durch die DELPHI IMM ansässig in Potsdam.<br></br>

                

            
            </div> 

        </div>)
        
    }
}