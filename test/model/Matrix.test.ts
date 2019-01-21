
import * as Matrix from "../../src/model/Matrix" 

let matrix = new Matrix.CSVMatrix("./testdata/201512_OT_4_2a_Bereinigt.csv")

test('CSVMatrix get row count', () => {
    expect(matrix.getRowCount()).toBe(63)
})

test('CSVMatrix get column count', () => {
  expect(matrix.getColumnCount()).toBe(63)
})


test('CSVMatrix get value at', () => {
  expect(matrix.getValueAt(5,5)).toBe(267)
})
