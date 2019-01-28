import * as R from 'ramda'

var DEBUG = true

export const on = () => {
    DEBUG = true
}

export const off = () => {
    DEBUG = false
}

export const trace = R.curry((message:string,some: any): any => {
    if(DEBUG){
        console.log(message,some)
    }
    return some
})
