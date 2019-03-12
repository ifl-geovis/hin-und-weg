import { Result } from "cubus";
import R from "ramda";
import * as Debug from "../debug";

Debug.on();
export type Operation = "Summe" | "Anzahl" | "Saldo" |
                 "Mittelwert" | "Mittelwert" | "Medianwert" |
                 "Minimum" | "Maximum" |
                 "Differenz";

export type AggregateData = Array<Result<number>>;

// TODO: More than 2 Dimensions (in this case years)
export default class Aggregator {

    public static create(operation: Operation) {
        return new Aggregator(operation);
    }

    public static createForGrouping(operation: Operation, groupByDimension: string) {
        return this.create(operation).setGroupByDimension(groupByDimension);
    }

    private groupByDimension: string | null;
    private operation: string;
    private defaultValue = R.curry((defaultNum: number, num: number) => isNaN(num) ? defaultNum : num);
    private rejectNaNs  = R.filter((result: Result<number>) => !isNaN(result.value));
    private toValues = R.map((result: Result<number>) => result.value);

    private constructor(operation: Operation) {
        this.operation = operation;
        this.groupByDimension = null;
    }

    public setGroupByDimension(dimension: string): Aggregator {
        this.groupByDimension = dimension;
        return this;
    }

    public aggregate(data: AggregateData): number | AggregateData {
       if (this.operation === "Summe" ) {
           return this.sum(data);
       }
       if (this.operation === "Anzahl" ) {
         return data.length;
       }
       if (this.operation === "Saldo" ) {
        return this.saldo(data);
       }
       if (this.operation === "Mittelwert") {
          return this.mean(data);
       }
       if (this.operation === "Medianwert" ) {
        return this.median(data);
       }
       if (this.operation === "Minimum" ) {
        return this.min(data);
       }
       if (this.operation === "Maximum" ) {
        return this.max(data);
       }
       if (this.operation === "Differenz") {
           return this.diff(data);
       }
       return data.length;
    }

    private sum(data: AggregateData) {
        const values = R.map((result) => this.defaultValue(0, result.value), data);
        return R.sum(values);
    }

    private mean(data: AggregateData) {
        return R.mean(this.toValues(this.rejectNaNs(data)));
    }

    private median(data: AggregateData) {
        return R.median(this.toValues(this.rejectNaNs(data)));
    }

    private min(data: AggregateData) {
        const values = this.toValues(this.rejectNaNs(data));
        return R.reduce(R.min, Number.MAX_VALUE, values);
    }

    private max(data: AggregateData) {
        const values = this.toValues(this.rejectNaNs(data));
        return R.reduce(R.max, Number.MIN_VALUE, values);
    }

    private saldo(data: AggregateData): AggregateData {

        return [
            {
                property: [
                    { name: "VonNach", value: "Berlin" },
                ],
                value: 0,
            },
        ];
    }

    private diff(data: AggregateData): AggregateData {
        return [
            {
                property: [
                    { name: "Von", value: "Berlin" },
                    { name: "Nach", value: "Paris" },
                ],
                value: 0,
            },
        ];
    }
}
