import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import 'cross-fetch/polyfill'
import { useQuery } from '@apollo/react-hooks'
import BrowserOnly from '../helpers/BrowserOnly'
import UnlockPropTypes from '../../propTypes'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import keyHolderQuery from '../../queries/keyHolder'

export const KeyChainContent = ({ account, network, router }) => {
  const { hash } = router.location
  const emailAddress = hash.slice(1) // trim off leading '#'

  return (
    <Layout title="Key Chain">
      <Head>
        <title>{pageTitle('Key Chain')}</title>
      </Head>
      {account && (
        <BrowserOnly>
          <Account network={network} account={account} />
          {keyDetails(account.address.toLowerCase())}
          <DeveloperOverlay />
        </BrowserOnly>
      )}
      {!account && (
        // Default to sign up form. User can toggle to login. If email
        // address is truthy, do the signup flow.
        <LogInSignUp signup emailAddress={emailAddress} />
      )}
    </Layout>
  )
}

KeyChainContent.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
  router: UnlockPropTypes.router.isRequired,
}

KeyChainContent.defaultProps = {
  account: null,
}

export const mapStateToProps = ({ account, network, router }) => {
  return {
    account,
    network,
    router,
  }
}

const keyDetails = address => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { address },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :(</p>

  return data.keyHolders[0].keys
    .map(ownedKeys => ownedKeys.lock)
    .map(({ id, name, expirationDuration, price }) => {
      return (
        <div key={id}>
          <p>{name}</p>
          <p>{expirationDuration}</p>
          <p>{price}</p>
        </div>
      )
    })
}

export default connect(mapStateToProps)(KeyChainContent)
