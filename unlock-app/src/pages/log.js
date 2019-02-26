import React from 'react'
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
import withConfig from '../utils/withConfig'

export const humanize = type => {
  if (!type) return ''
  let parts = type.split('_')
  return parts.map(part => part[0] + part.slice(1).toLowerCase()).join(' ')
}

export const Log = ({ account, network, transactionFeed, metadata }) => {
  return (
    <GlobalErrorProvider>
      <GlobalErrorConsumer>
        <Layout title="Creator Log">
          <Head>
            <title>{pageTitle('Log')}</title>
          </Head>
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <Content>
              <LogHeader>Block Number</LogHeader>
              <LogHeader>Lock Name/Address</LogHeader>
              <LogHeader>Type</LogHeader>
              {transactionFeed.map(tx => {
                const { href, readableName, lock } = metadata[tx.hash]
                return (
                  <React.Fragment key={tx.hash}>
                    <LogElement>{tx.blockNumber}</LogElement>
                    <Address href={href} target="_blank">
                      {lock}
                    </Address>
                    <Type type={tx.type}>{readableName}</Type>
                  </React.Fragment>
                )
              })}
            </Content>
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
  transactionFeed: PropTypes.arrayOf(UnlockPropTypes.transaction).isRequired,
  metadata: PropTypes.object.isRequired,
}

const Content = styled.div`
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
  font-family: 'IBM Plex Mono', Courier, monospace;
`

// TODO: determine which transaction types get which color
const typeColors = {
  LOCK_CREATION: 'green',
}

const Type = styled(LogElement)`
  color: ${props => 'var(--' + typeColors[props.type] || 'darkgrey'});
  white-space: nowrap;
`

const Address = styled.a`
  font-size: 11px;
  font-weight: 300;
  font-family: 'IBM Plex Mono', Courier, monospace;
`

export const mapStateToProps = (
  { account, network, transactions },
  { config: { chainExplorerUrlBuilders } }
) => {
  const transactionFeed = Object.values(transactions).sort(
    (a, b) => b.blockNumber - a.blockNumber
  )

  // Calculated metadata stored separately from the transactionFeed to avoid
  // mutating the state by assigning to the objects
  let metadata = {}

  transactionFeed.forEach(tx => {
    const href = chainExplorerUrlBuilders.etherScan(tx.lock) || undefined
    const readableName = humanize(tx.type)
    let lock = tx.lock

    // Key purchases don't have a lock field, but they do encode the lock the
    // key is for as part of the key field. So here we create the necessary lock
    // field.
    if (tx.type === 'KEY_PURCHASE') {
      lock = tx.key.split('-')[0]
    }

    metadata[tx.hash] = {
      href,
      readableName,
      lock,
    }
  })

  return {
    account,
    network,
    transactionFeed,
    metadata,
  }
}

export default withConfig(connect(mapStateToProps)(Log))
