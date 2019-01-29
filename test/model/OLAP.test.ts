import { expect } from "chai"
import R from 'ramda'
import Cubus from 'cubus'
import fs from 'fs'

let [first,second,third] = [R.nth(0), R.nth(1), R.nth(2)]

const dimensions = [
    'Jahr',
    'von',
    'nach'
]

const values = [
    [ 29,  4, 28, 18, 18,  7],
    [  4, 46, 24, 32, 23, 13],
    [ 13, 46,470, 88, 55, 25],
    [ 16, 17, 83,235, 68, 24],
    [ 23, 25, 76, 96,256,106],
    [  9, 16, 23, 38, 96,267],
]
// Create structure
const migrations = new Cubus<number>(dimensions)
migrations.addDimensionValue('Jahr', '2015')
migrations.addDimensionValue('Jahr', '2016')

const ortsteilIds = ['00','01','02','03','04','05']
R.forEach(ot => migrations.addDimensionValue('von',ot),ortsteilIds)
R.forEach(ot => migrations.addDimensionValue('nach',ot),ortsteilIds)

// Add data
for(let nachIdx=0;nachIdx<values.length;nachIdx++){
    let vonValues = values[nachIdx]
    for(let vonIdx=0;vonIdx<vonValues.length;vonIdx++){
        let value = vonValues[vonIdx]
        migrations.add(value,{'Jahr':'2015','von':ortsteilIds[vonIdx],'nach':ortsteilIds[nachIdx]})
        migrations.add(value-5,{'Jahr':'2016','von':ortsteilIds[vonIdx],'nach':ortsteilIds[nachIdx]})
    } 
}

it('Cubus for migrations can be created ', () => {
    expect(migrations).not.equal(null)
})

it('Von "02" nach 03 81 Umzüge ', () => {
    let results = migrations.query({'Jahr':['2015'],
        'von':['02'], 'nach':['03']
    })    
    expect(results).to.have.length(1)

    let result = first(results)!
    expect(result.value).equal(83)
    let dims = result.property
    expect(dims).to.have.length(3)
    expect(first(dims)!.name).equal('Jahr')
    expect(first(dims)!.value).equal('2015')
    expect(second(dims)!.name).equal('von')
    expect(second(dims)!.value).equal('02')
    expect(third(dims)!.name).equal('nach')
    expect(third(dims)!.value).equal('03')
})

it('Von "01" nach "02" waren es 46 und nach "03" 17 Umzüge', () => {
    let results = migrations.query({'Jahr':['2015'],
        'von':['01'], 'nach':['02','03']
    })    
    expect(results).to.have.length(2)
    
    let firstResult = first(results)!
    let secondResult = second(results)!

    expect(firstResult.value).equal(46)
    let dims = firstResult.property
    expect(dims).to.have.length(3)
    expect(first(dims)!.name).equal('Jahr')
    expect(first(dims)!.value).equal('2015')
    expect(second(dims)!.name).equal('von')
    expect(second(dims)!.value).equal('01')
    expect(third(dims)!.name).equal('nach')
    expect(third(dims)!.value).equal('02')

    expect(secondResult.value).equal(17)
})

it('2015: 01,02,03 => 03,04,05 und 2016: 01,02,03 => 03,04,05: ', () => {
    let results = migrations.query({'Jahr':['2015','2016'],
        'von':['01','02','03'], 'nach':['03','04','05']
    })    
    expect(results).to.have.length(18)
    let values = R.map(result => result.value,results)
    
    expect(values).eql([17, 12, 83, 78, 235, 230, 25, 20, 76, 71, 96, 91, 16, 11, 23, 18, 38, 33])  
})

it('Create Datacube from csv matrix for one year',() => {
    let csv = fs.readFileSync("./testdata/201512_OT_4_2a_Bereinigt.csv").toString()
    let rows = R.reject(R.isEmpty,csv.split(/\n|\r\n/)) as string[]
    expect(R.length(rows)).equal(64)
    let columns = R.nth(0,rows)!.split(/;|,|:/) as string[]
    expect(R.length(columns)).equal(64)
    
    // ---
    let defaultStr = R.defaultTo('')
    let toColumns = R.split(/;|,|:/)
    let xAxis = toColumns(defaultStr(first(rows)))
    expect(R.length(xAxis)).equal(64)

    let firstColumn = R.pipe(toColumns,first,defaultStr)
    let yAxis = R.map(firstColumn,rows) 
    expect(R.length(yAxis)).equal(64)
    
    let migrations = new Cubus(dimensions)
    migrations.addDimensionValue('Jahr','2015')
    R.forEach(ot => migrations.addDimensionValue('von',ot),yAxis)
    R.forEach(ot => migrations.addDimensionValue('nach',ot),xAxis)
  
    yAxis.forEach((y) => {
        let yIndex = R.indexOf(y,yAxis)
        xAxis.forEach((x) => {
            let xIndex = R.indexOf(x,xAxis)
            let value = parseFloat(toColumns(rows[yIndex])[xIndex])
            let property = {'Jahr':'2015','von': y,'nach':x}
            migrations.add(value,property)
        },xAxis)
    }, yAxis)

    let checkFirst = (von:string, nach:string, expected:number) => {
        let results = migrations.query({'Jahr':['2015'],'von':[von], 'nach':[nach]})        
        expect(results[0].value).equal(expected)              
    }    
    checkFirst('23','42',0)
    checkFirst('42','23',3)
    checkFirst('3','71',35)

    let xResults = migrations.query({'von':['5'],'nach':['23','42']})
    expect(R.length(xResults)).equal(2)
    expect(xResults[0].value).equal(5)
    expect(xResults[1].value).equal(0)

    let yResults = migrations.query({'von':['5','23'],'nach':['23']})
    expect(R.length(yResults)).equal(2)
    expect(yResults[0].value).equal(5)
    expect(yResults[1].value).equal(190)

    let _2dResults = migrations.query({'von':['5','23'],'nach':['23','42']})
    expect(R.length(_2dResults)).equal(4)
    expect(_2dResults[0].value).equal(5)
    expect(_2dResults[1].value).equal(190)
    expect(_2dResults[2].value).equal(0)
    expect(_2dResults[3].value).equal(0)
})