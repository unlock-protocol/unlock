import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import * as UnlockTypes from '../../unlockTypes'
import { DefaultError } from './FatalError'
import Loading from '../interface/Loading'

interface Props {
  transactionFeed: UnlockTypes.Transaction[]
  explorerLinks: { [key: string]: string }
  loading: boolean
}

export const CreatorLog = ({
  transactionFeed,
  explorerLinks,
  loading,
}: Props) => {
  return (
    <>
      <Grid>
        <HeaderItem>Block Number</HeaderItem>
        <HeaderItem>Lock Name/Address</HeaderItem>
        <HeaderItem>Type</HeaderItem>
        {transactionFeed.length > 0 &&
          transactionFeed.map(tx => {
            return (
              <React.Fragment key={tx.hash}>
                <BlockNumber>{tx.blockNumber}</BlockNumber>
                <Address href={explorerLinks[tx.hash]} target="_blank">
                  {tx.lock}
                </Address>
                <Type type={tx.type}>{tx.type}</Type>
              </React.Fragment>
            )
          })}
      </Grid>
      {transactionFeed.length === 0 && !loading && (
        <DefaultError
          title="Your log is empty: No transactions yet."
          illustration="/static/images/illustrations/mug.svg"
          critical={false}
        >
          Check back after you&#8216;ve created a lock.
        </DefaultError>
      )}
      {loading && <Loading />}
    </>
  )
}

interface State {
  loading: UnlockTypes.Loading
}

export const mapStateToProps = ({ loading }: State) => {
  return {
    loading: !!loading,
  }
}

export default connect(
  mapStateToProps,
  null
)(CreatorLog)

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

const typeColors: { [key in UnlockTypes.TransactionType]: string } = {
  [UnlockTypes.TransactionType.LOCK_CREATION]: 'green',
  [UnlockTypes.TransactionType.KEY_PURCHASE]: 'slate',
  [UnlockTypes.TransactionType.UPDATE_KEY_PRICE]: 'slate',
  [UnlockTypes.TransactionType.WITHDRAWAL]: 'slate',
}

const Type = styled(Entry)`
  color: ${(props: { type: UnlockTypes.TransactionType }) =>
    'var(--' + typeColors[props.type]});
  white-space: nowrap;
`
