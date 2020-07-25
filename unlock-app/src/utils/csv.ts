import { camelCaseToTitle } from './strings'

export const buildCSV = (columns: string[], objects: any[]) => {
  const csv = objects
    .map((datum: any) => {
      return columns
        .map((col: string) => {
          return `"${datum[col] ? datum[col] : ''}"`
        })
        .join(',')
    })
    .filter((row) => row)

  csv.unshift(columns.map((col: string) => camelCaseToTitle(col)).join(','))
  return csv.join('\n')
}
