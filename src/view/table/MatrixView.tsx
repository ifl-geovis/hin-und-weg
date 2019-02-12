import React from 'react'
import LinkView from './LinkView'

export interface MatrixViewProps {

}

export default class MatrixView extends React.Component<MatrixViewProps>{

    constructor(props: MatrixViewProps){
        super(props)
    }

    render():JSX.Element{
        return <div>
            <LinkView fieldNames={['ID','OT']} onLabelSelect={console.log} onIdSelect={console.log}/>
            <div>Insert Matrix table here.</div>
        </div>
    }

}