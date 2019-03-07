import { Result } from "cubus";
import R from "ramda";
import * as Debug from "../../src/debug";

Debug.on();

// TODO: Refactor values hharmonization
// TODO: More than 2 Dimensions (in this case years)
export default class Aggregator {

    private operation: string;
    private defaultValue = R.curry((defaultNum: number, num: number) => isNaN(num) ? defaultNum : num);
    private rejectNaNs  = R.filter((result: Result<number>) => !isNaN(result.value));

    constructor(operation: string) {
        this.operation = operation;
    }

    public aggregate(data: Array<Result<number>>): number {
       if (this.operation === "Summe" ){
           return this.sum(data);
       }
       if (this.operation === "Anzahl" ){
         return data.length;
       }
       if (this.operation === "Mittelwert" ){
          return this.mean(data);
       }
       if (this.operation === "Medianwert" ){
        return this.median(data);
       }
       if (this.operation === "Minimum" ){
        return this.min(data);
       }
       if (this.operation === "Maximum" ){
        return this.max(data);
       }
       return data.length;
    }

    private sum(data: Array<Result<number>>) {
        const values = R.map((result) => this.defaultValue(0, result.value), data);
        return R.sum(values);
    }

    private mean(data: Array<Result<number>>) {
        const values = R.map((result) => result.value, R.filter((result) => !isNaN(result.value), data));
        return R.mean(values);
    }

    private median(data: Array<Result<number>>) {
        const values = R.map((result) => result.value, R.filter((result) => !isNaN(result.value), data));
        return R.median(values);
    }

    private min(data: Array<Result<number>>) {
        const values = R.map((result) => result.value, R.filter((result) => !isNaN(result.value), data));
        return R.reduce(R.min, Number.MAX_VALUE, values);
    }

    private max(data: Array<Result<number>>) {
        const values = R.map((result) => result.value, R.filter((result) => !isNaN(result.value), data));
        return R.reduce(R.max, Number.MIN_VALUE, values);
    }
}
