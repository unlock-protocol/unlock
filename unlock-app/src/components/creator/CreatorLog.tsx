import React from 'react'
import styled from 'styled-components'
import * as UnlockTypes from '../../unlock'

interface Props {
  transactionFeed: UnlockTypes.Transaction[]
  transactionMetadata: UnlockTypes.TransactionMetadataMap
}

const CreatorLog = (props: Props) => {
  const { transactionFeed, transactionMetadata } = props
  return (
    <Grid>
      <HeaderItem>Block Number</HeaderItem>
      <HeaderItem>Lock Name/Address</HeaderItem>
      <HeaderItem>Type</HeaderItem>
      {transactionFeed.map(tx => {
        const { href, readableName } = transactionMetadata[tx.hash]
        return (
          <React.Fragment key={tx.hash}>
            <BlockNumber>{tx.blockNumber}</BlockNumber>
            <Address href={href} target="_blank">
              {tx.lock}
            </Address>
            <Type type={tx.type}>{readableName}</Type>
          </React.Fragment>
        )})}
    </Grid>
  )
}

export default CreatorLog

const Grid = styled.div`
    display: grid;
    grid-template-columns: 125px 2fr 1fr;
    grid-auto-rows: 32px;
    grid-column-gap: 20px;
`

const HeaderItem = styled.div`
    font-size: 10px;
    font-weight: normal;
    text-transform: uppercase;
    color: var(--grey);
    white-space: nowrap;
`

const Entry = styled.div`
    font-size: 14px;
    line-height: 14px;
    color: var(--darkgrey);
    font-weight: 300;
    font-family: 'IBM Plex Mono', Courier, monospace;
`

const BlockNumber = styled(Entry)``

const Address = styled.a`
    font-size: 14px;
    font-weight: 300;
    font-family: 'IBM Plex Mono', Courier, monospace;
`

const typeColors: { [key: string]: string } = {
  'LOCK_CREATION': 'green',
}

const Type = styled(Entry)`
  color: ${(props: { type: string } ) => 'var(--' + (typeColors[props.type] || 'slate')});
  white-space: nowrap;
`
