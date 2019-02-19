import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
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

  const fetchTransactions = () => {
    let lockPromises = lockAddresses.map(address =>
      w3s.getPastLockTransactions(address)
    )
    lockPromises = [
      ...lockPromises,
      w3s.getPastLockCreationsTransactionsForUser(account.address),
    ]
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
      fetchTransactions()
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
            <ol>
              {transactions.map(tx => (
                <li key={tx.id}>{tx.blockNumber + ' ' + tx.event}</li>
              ))}
            </ol>
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

export const mapStateToProps = ({ account, network, locks }) => {
  const lockAddresses = Object.keys(locks)
  return {
    account,
    network,
    lockAddresses,
  }
}

export default connect(mapStateToProps)(Log)
