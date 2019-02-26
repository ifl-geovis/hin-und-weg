import { Cell, Column, RenderMode, RowHeaderCell, SelectionModes, Table } from "@blueprintjs/table";
import { Result } from "cubus";
import R from "ramda";
import React from "react";

export interface ICubusResultViewProps {
    results: Array<Result<number>>;
}

export default class CubusResultView extends React.Component<ICubusResultViewProps> {

    constructor(props: ICubusResultViewProps) {
        super(props);
    }

    public render(): JSX.Element {
        const rowNames = R.uniq(R.map((result) => result.property[1].value, this.props.results));
        const columnNames = R.uniq(R.map((result) => result.property[2].value, this.props.results));

        const getValueAt = (rowNum: number, columnNum: number ): number | string => {
            const found = R.find((result) => {
               return result.property[1].value === rowNames[rowNum % rowNames.length] &&
                      result.property[2].value === columnNames[columnNum % columnNames.length];
            }, this.props.results).value;
            return isNaN(found) ? "." : found;
        };

        const cellRenderer = (rowNum: number, colNum: number) => {
            return <Cell key={rowNum + ":" + colNum}>{getValueAt(rowNum, colNum)}</Cell>;
        };
        const rowHeaderCellRenderer = (rowIndex: number ) => {
            return <RowHeaderCell>{rowNames[rowIndex % rowNames.length]}</RowHeaderCell>;
        };
        const createColumn = (column: number) => {
            return <Column key={column} name={columnNames[column % columnNames.length]} cellRenderer={cellRenderer}/>;
        };
        const columns = R.map(createColumn, R.range(0, columnNames.length));
        const matrixUI = (
            <Table rowHeaderCellRenderer={rowHeaderCellRenderer} numRows={rowNames.length}
                   selectionModes={SelectionModes.ALL}
                  //onSelection={this.updateDiagram.bind(this)}
            >
            {columns}
            </Table>
        );
        return <div>{matrixUI}</div>;
    }
}
