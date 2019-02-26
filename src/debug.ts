import R from "ramda";

let DEBUG = true;

export const on = () => {
    DEBUG = true;
};

export const off = () => {
    DEBUG = false;
};

export const log = (message: string): void => {
    console.log(message);
};

export const trace = R.curry((message: string, some: any): any => {
    if (DEBUG) {
        console.log(message, some);
    }
    return some;
});
