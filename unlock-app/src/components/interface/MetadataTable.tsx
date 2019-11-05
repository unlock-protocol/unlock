import React from 'react'
import styled from 'styled-components'

interface KeyMetadata {
  // These 3 properties are always present -- they come down from the graph as
  // strings
  lockName: string
  expiration: string
  keyholderAddress: string
  // Can have any other arbitrary properies, as long as the values are strings.
  [key: string]: string
}

interface Props {
  // The keys to the metadata object, in the order they will be displayed.
  columns: string[]
  metadata: KeyMetadata[]
}

/**
 * Applied to itself, yields "Camel Case To Title"
 */
export function camelCaseToTitle(s: string): string {
  return (
    s
      // insert a space between lower & upper
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // space before last upper in a sequence followed by lower
      .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
      // uppercase the first character
      .replace(/^./, str => str.toUpperCase())
  )
}

export const MetadataTable = ({ columns, metadata }: Props) => {
  return (
    <Table>
      <Thead>
        <tr>
          {columns.map(col => {
            return <Th key={col}>{camelCaseToTitle(col)}</Th>
          })}
        </tr>
      </Thead>
      <Tbody>
        {metadata.map(datum => {
          return (
            <tr
              key={datum.lockName + datum.expiration + datum.keyholderAddress}
            >
              {columns.map(col => {
                return <Td key={col}>{datum[col]}</Td>
              })}
            </tr>
          )
        })}
      </Tbody>
    </Table>
  )
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Thead = styled.thead`
  background-color: var(--brand);
  color: var(--white);
`

const Tbody = styled.tbody`
  color: var(--slate);
  & > tr:nth-child(even) {
    background-color: var(--lightgrey);
  }
`

const Td = styled.td`
  padding: 0.5rem;
  text-align: left;
`

const Th = styled.th`
  padding: 0.5rem;
  text-align: left;
`

export default MetadataTable
