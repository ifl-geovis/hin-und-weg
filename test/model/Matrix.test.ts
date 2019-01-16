
import * as Matrix from "../../src/model/Matrix" 

let matrix = new Matrix.CSVMatrix("./testdata/201512_OT_4_2a_Bereinigt.csv")

test('CSVMatrix get row count', () => {
    expect(matrix.getRowCount()).toBe(65)
})

test('CSVMatrix get column count', () => {
  expect(matrix.getColumnCount()).toBe(64)
})

test('CSVMatrix get row at ', () => {
  expect(matrix.getRowAt(12)).toEqual([14,
    0,
    NaN,
    NaN,
    0,
    7,
    NaN,
    4,
    16,
    3,
    6,
    39,
    88,
    10,
    0,
    6,
    NaN,
    5,
    12,
    3,
    0,
    5,
    0,
    0,
    5,
    5,
    4,
    test('CSVMatrix get row count', () => {
      expect(matrix.getRowCount()).toBe(65)
  })    6,
    0,
    0,
    9,
    0,
    0,
    4,
    0,
    0,
    NaN,
    0,
    NaN,
    0,
    0,
    test('CSVMatrix get row count', () => {
      expect(matrix.getRowCount()).toBe(65)
  })    0,
    NaN,
    NaN,
    0,
    4,
    NaN,
    0,
    4,
    4,
    NaN,
    NaN,
    test('CSVMatrix get row count', () => {
      expect(matrix.getRowCount()).toBe(65)
  })    3,
    NaN,
    8,
    NaN,
    0,
    0,
    3,
    5,
    3,
    13,
    4,
    6])
})


test('CSVMatrix get column at', () => {
  expect(matrix.getColumnAt(5)).toEqual([4, 18, 23, 55, 68, 256, 96, 41, 20, 4, 3, 6, 7, 0, 23, 9, 20, 6, 11, NaN, 0, 4, 0, 0, 43, 20, 5, NaN, 0, NaN, 48, 15, 6, 7, 3, 29, 49, 9, 5, 0, 0, 0, 8, 9, NaN, 10, 5, NaN, 11, 40, 4, 12, 6, 3, 14, 3, 3, NaN, 54, 19, 8, 9, 0, 8, undefined])
})

test('CSVMatrix get value at', () => {
  expect(matrix.getValueAt(5,5)).toBe(256)
})
