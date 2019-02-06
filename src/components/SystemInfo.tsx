import * as React from "react"

export interface SystemInfoProps {
    version: string
}

export class SystemInfo extends React.Component<SystemInfoProps,{}> { 

    constructor(props:SystemInfoProps){
        super(props)
    }
    
    render() {
        return (                
                <table className="bp3-html-table .bp3-small .bp3-html-table-bordered .bp3-html-table-condensed">
                    <thead>
                        <tr>
                            <th>Hin & weg Version</th>
                            <th>Node Version</th>
                            <th>Chrome Version</th>
                            <th>Electron Version</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{this.props.version}</td>
                            <td>{process.versions.node}</td>
                            <td>{process.versions.chrome}</td>
                            <td>{process.versions.electron}</td>
                        </tr>
                    </tbody>
                </table>
        )
    }
}