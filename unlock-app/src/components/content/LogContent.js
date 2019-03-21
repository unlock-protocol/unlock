import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import UnlockPropTypes from '../../propTypes'
import Layout from '../interface/Layout'
import CreatorAccount from '../creator/CreatorAccount'
import BrowserOnly from '../helpers/BrowserOnly'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'
import withConfig from '../../utils/withConfig'

export const LogContent = ({ account, network, transactionFeed }) => {
  return (
    <GlobalErrorConsumer>
      <Layout title="Creator Log">
        <Head>
          <title>{pageTitle('Log')}</title>
        </Head>
        {account && (
          <BrowserOnly>
            <CreatorAccount network={network} account={account} />
            <Content>
              <LogHeader>Block Number</LogHeader>
              <LogHeader>Lock Name/Address</LogHeader>
              <LogHeader>Type</LogHeader>
              {transactionFeed.map(tx => (
                <React.Fragment key={tx.hash}>
                  <LogElement>{tx.blockNumber}</LogElement>
                  <Address href={tx.href} target="_blank">
                    {tx.lock}
                  </Address>
                  <Type type={tx.type}>{tx.type}</Type>
                </React.Fragment>
              ))}
            </Content>
          </BrowserOnly>
        )}
      </Layout>
    </GlobalErrorConsumer>
  )
}

LogContent.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
  transactionFeed: PropTypes.arrayOf(UnlockPropTypes.transaction).isRequired,
}

LogContent.defaultProps = {
  account: null,
}

const Content = styled.div`
  display: grid;
  grid-template-columns: 125px 2fr 1fr;
  grid-auto-rows: 32px;
  grid-column-gap: 20px;
`

const LogHeader = styled.div`
  font-size: 10px;
  font-weight: normal;
  text-transform: uppercase;
  color: var(--grey);
  white-space: nowrap;
`

const LogElement = styled.div`
  font-size: 14px;
  line-height: 14px;
  color: var(--darkgrey);
  font-weight: 300;
  font-family: 'IBM Plex Mono', Courier, monospace;
`

// TODO: determine which transaction types get which color
const typeColors = {
  'Lock Creation': 'green',
}

const Type = styled(LogElement)`
  color: ${props => 'var(--' + (typeColors[props.type] || 'slate')});
  white-space: nowrap;
`

const Address = styled.a`
  font-size: 14px;
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

  transactionFeed.forEach((tx, i) => {
    transactionFeed[i].href =
      chainExplorerUrlBuilders.etherScan(tx.lock) || undefined
  })

  return {
    account,
    network,
    transactionFeed,
  }
}

export default withConfig(connect(mapStateToProps)(LogContent))
