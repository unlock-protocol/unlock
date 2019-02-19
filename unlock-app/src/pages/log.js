import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../propTypes'
import Layout from '../components/interface/Layout'
import CreatorAccount from '../components/creator/CreatorAccount'
import BrowserOnly from '../components/helpers/BrowserOnly'
import GlobalErrorConsumer from '../components/interface/GlobalErrorConsumer'
import GlobalErrorProvider from '../utils/GlobalErrorProvider'
import { pageTitle } from '../constants'
import Web3Service from '../services/web3Service'

export const Log = ({ account, network, lockAddresses }) => {
  const [transactions, setTransactions] = useState([])
  const w3s = new Web3Service()
  // TODO: this can be smarter. We can probably cache a lot of this in
  // localStorage and maintain a list of the last blockNumber we checked. With
  // an update to _getPastTransactionsForContract to accept a fromBlock
  // parameter we can then only query for data we don't already hold and merge
  // it with what we've stored.
  const fetchTransactions = () => {
    let lockPromises = lockAddresses.map(address =>
      w3s.getPastLockTransactions(address)
    )
    lockPromises.push(
      w3s.getPastLockCreationsTransactionsForUser(account.address)
    )
    Promise.all(lockPromises).then(values => {
      // `values` is an array of arrays (one array, possibly empty, for each
      // lock address) so we'll flatten that out and sort the whole thing for
      // display
      const reducer = (acc, current) => [...acc, ...current]
      let allTransactions = values.reduce(reducer, [])
      allTransactions = allTransactions.sort(
        (a, b) => b.blockNumber - a.blockNumber
      )
      setTransactions(allTransactions)
    })
  }

  useEffect(
    () => {
      if (account) {
        fetchTransactions()
      }
    },
    [account, lockAddresses]
  )

  return (
    <GlobalErrorProvider>
      <GlobalErrorConsumer>
        <Layout title="Creator Log">
          <Head>
            <title>{pageTitle('Log')}</title>
          </Head>
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <Body>
              <LogHeader>Block Number</LogHeader>
              <LogHeader>Lock Name/Address</LogHeader>
              <LogHeader>Type</LogHeader>
              {transactions.length > 0 &&
                transactions.map(tx => (
                  <>
                    <LogElement key={tx.id + '__blockNumber'}>
                      {tx.blockNumber}
                    </LogElement>
                    <LogElement key={tx.id + '__address'}>
                      {tx.address}
                    </LogElement>
                    <Type key={tx.id + '__type'} type={tx.event}>
                      {tx.event}
                    </Type>
                  </>
                ))}
            </Body>
          </BrowserOnly>
        </Layout>
      </GlobalErrorConsumer>
    </GlobalErrorProvider>
  )
}

Log.displayName = 'Log'

Log.propTypes = {
  account: UnlockPropTypes.account.isRequired,
  network: UnlockPropTypes.network.isRequired,
  lockAddresses: PropTypes.arrayOf(UnlockPropTypes.address).isRequired,
}

const Body = styled.div`
  display: grid;
  grid-template-columns: min-content min-content min-content;
  grid-auto-rows: 20px;
  grid-column-gap: 20px;
`

const LogHeader = styled.div`
  font-size: 8px;
  font-weight: normal;
  text-transform: uppercase;
  color: var(--grey);
  white-space: nowrap;
`

const LogElement = styled.div`
  font-size: 11px;
  font-weight: 300;
`

const typeColors = {
  NewLock: 'green',
}

const Type = styled(LogElement)`
  color: ${props => 'var(--' + typeColors[props.type] || 'darkgrey'});
`

export const mapStateToProps = ({ account, network, locks }) => {
  const lockAddresses = Object.keys(locks)
  return {
    account,
    network,
    lockAddresses,
  }
}

export default connect(mapStateToProps)(Log)
