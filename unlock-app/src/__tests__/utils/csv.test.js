import { vi, describe, beforeAll, expect, it } from 'vitest'
import { buildCSV } from '../../utils/csv'

describe('buildCSV', () => {
  it('should build various CSV files', () => {
    expect.assertions(6)
    let rows = []
    let objects = [{}]
    expect(buildCSV(rows, objects)).toEqual('')

    objects = [
      { name: 'julien', age: 36 },
      { name: 'chris', age: 25 },
    ]
    expect(buildCSV(rows, objects)).toEqual('')

    rows = ['name']
    expect(buildCSV(rows, objects)).toEqual(`Name
"julien"
"chris"`)

    rows = ['name', 'age']
    expect(buildCSV(rows, objects)).toEqual(`Name,Age
"julien","36"
"chris","25"`)

    rows = ['name', 'age', 'city']
    expect(buildCSV(rows, objects)).toEqual(`Name,Age,City
"julien","36",""
"chris","25",""`)

    objects = [
      { name: 'julien', age: 36, eyes: 'brown' },
      { name: 'chris', age: 25, eyes: 'blue' },
    ]
    expect(buildCSV(rows, objects)).toEqual(`Name,Age,City
"julien","36",""
"chris","25",""`)
  })
})
