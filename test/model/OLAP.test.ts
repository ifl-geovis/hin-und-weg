import R from 'ramda'
import Cubus from 'cubus'

//Utils
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
const migrations = new Cubus(dimensions)
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

test('Cubus for migrations can be created ', () => {
    expect(migrations).not.toBe(null)
})

test('Von "02" nach 03 81 Umzüge ', () => {
    let results = migrations.query({'Jahr':['2015'],
        'von':['02'], 'nach':['03']
    })    
    expect(results).toHaveLength(1)

    let result = first(results)!
    expect(result.value).toEqual(83)

    let dims = result.property
    expect(dims).toHaveLength(3)
    expect(first(dims)!.name).toEqual('Jahr')
    expect(first(dims)!.value).toEqual('2015')
    expect(second(dims)!.name).toEqual('von')
    expect(second(dims)!.value).toEqual('02')
    expect(third(dims)!.name).toEqual('nach')
    expect(third(dims)!.value).toEqual('03')
})

test('Von "01" nach "02" waren es 46 und nach "03" 17 Umzüge', () => {
    let results = migrations.query({'Jahr':['2015'],
        'von':['01'], 'nach':['02','03']
    })    
    expect(results).toHaveLength(2)
    
    let firstResult = first(results)!
    let secondResult = second(results)!

    expect(firstResult.value).toEqual(46)
    let dims = firstResult.property
    expect(dims).toHaveLength(3)
    expect(first(dims)!.name).toEqual('Jahr')
    expect(first(dims)!.value).toEqual('2015')
    expect(second(dims)!.name).toEqual('von')
    expect(second(dims)!.value).toEqual('01')
    expect(third(dims)!.name).toEqual('nach')
    expect(third(dims)!.value).toEqual('02')

    expect(secondResult.value).toEqual(17)
})

test('2015: 01,02,03 => 03,04,05 und '+
  '\n 2016: 01,02,03 => 03,04,05: ', () => {
    let results = migrations.query({'Jahr':['2015','2016'],
        'von':['01','02','03'], 'nach':['03','04','05']
    })    
    expect(results).toHaveLength(18)
    let values = R.map(result => result.value,results)
    
    expect(values).toEqual([17, 12, 83, 78, 235, 230, 25, 20, 76, 71, 96, 91, 16, 11, 23, 18, 38, 33])  
})

// Read a real file 
import * as fs from "fs"

test('Create Datacube from csv matrix for one year',() => {
    let csv = fs.readFileSync("./testdata/201512_OT_4_2a_Bereinigt.csv").toString()
    let rows = R.reject(R.isEmpty,csv.split(/\n|\r\n/)) as string[]
    expect(R.length(rows)).toEqual(64)
    let columns = R.nth(0,rows)!.split(/;|,|:/) as string[]
    expect(R.length(columns)).toEqual(64)
    
    // ---
    let defaultStr = R.defaultTo('')
    let toColumns = R.split(/;|,|:/)
    let xAxis = toColumns(defaultStr(first(rows)))
    expect(R.length(xAxis)).toEqual(64)

    let firstColumn = R.pipe(toColumns,first,defaultStr)
    let yAxis = R.map(firstColumn,rows) 
    expect(R.length(yAxis)).toEqual(64)
    
    let migrations = new Cubus(dimensions)
    migrations.addDimensionValue('Jahr','2015')
    R.forEach(ot => migrations.addDimensionValue('von',ot),yAxis)
    R.forEach(ot => migrations.addDimensionValue('nach',ot),xAxis)
  
    yAxis.forEach((y) => {
        let yIndex = R.indexOf(y,yAxis)
        xAxis.forEach((x) => {
            let xIndex = R.indexOf(x,xAxis)
            let value = toColumns(rows[yIndex])[xIndex]
            let property = {'Jahr':'2015','von': y,'nach':x}
            migrations.add(value,property)
        },xAxis)
    }, yAxis)

    let checkOne = (von:string,nach:string,expected:string) => {
        let results = migrations.query({'Jahr':['2015'],'von':[von], 'nach':[nach]})
        expect(results[0]['value']).toEqual(expected)
    }    
    checkOne('23','42','0')
    checkOne('42','23','3')
    checkOne('3','71','35')

    let xResults = migrations.query({'von':['5'],'nach':['23','42']})
    expect(R.length(xResults)).toEqual(2)
    expect(xResults[0].value).toEqual('5')
    expect(xResults[1].value).toEqual('0')

    let yResults = migrations.query({'von':['5','23'],'nach':['23']})
    expect(R.length(yResults)).toEqual(2)
    expect(yResults[0].value).toEqual('5')
    expect(yResults[1].value).toEqual('190')

    let _2dResults = migrations.query({'von':['5','23'],'nach':['23','42']})
    expect(R.length(_2dResults)).toEqual(4)
    expect(_2dResults[0].value).toEqual('5')
    expect(_2dResults[1].value).toEqual('190')
    expect(_2dResults[2].value).toEqual('0')
    expect(_2dResults[3].value).toEqual('0')
})