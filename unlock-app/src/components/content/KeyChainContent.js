import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import 'cross-fetch/polyfill'
import { useQuery } from '@apollo/react-hooks'
import styled from 'styled-components'
import BrowserOnly from '../helpers/BrowserOnly'
import UnlockPropTypes from '../../propTypes'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import keyHolderQuery from '../../queries/keyHolder'
import {
  expirationAsDate,
  durationsAsTextFromSeconds,
} from '../../utils/durations'

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

const formatPrice = price => {
  return parseInt(price) / Math.pow(10, 18)
}

const keyDetails = address => {
  const { loading, error, data } = useQuery(keyHolderQuery(), {
    variables: { address },
  })

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error :c</p>

  if (data.keyHolders.length == 0) {
    return <div></div>
  }

  return (
    <Container>
      {data.keyHolders[0].keys.map(ownedKeys => {
        return (
          <Box key={ownedKeys.lock.id}>
            <LockName>{ownedKeys.lock.name}</LockName>
            <LockExpirationDuration>
              {durationsAsTextFromSeconds(ownedKeys.lock.expirationDuration)}
            </LockExpirationDuration>

            <ValidUntil>Valid Until</ValidUntil>
            <KeyExpiration>
              {expirationAsDate(ownedKeys.expiration)}
            </KeyExpiration>

            <KeyPrice>Ξ {formatPrice(ownedKeys.lock.price)}</KeyPrice>
          </Box>
        )
      })}
    </Container>
  )
}

export default connect(mapStateToProps)(KeyChainContent)

const Box = styled.div`
  border: thin #dddddd solid;
  width: 212px;
  float: left;
  margin-right: 32px;
  &:hover {
    border: thin #aaaaaa solid;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
`

const LockName = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  /* or 127% */

  display: flex;
  align-items: center;
  color: #4d8be8;
  padding: 16px;
`

const LockExpirationDuration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 19px;
  /* identical to box height, or 127% */

  display: flex;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  padding-bottom: 18px;

  /* Grey 4 */

  color: #333333;
`

const ValidUntil = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 8px;
  line-height: 10px;
  /* identical to box height */

  letter-spacing: 1px;
  text-transform: uppercase;
  color: #a6a6a6;
  padding-left: 16px;
`

const KeyExpiration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
  padding-left: 16px;
  padding-bottom: 10px;
`

const KeyPrice = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  /* identical to box height, or 125% */

  color: #333333;
  padding-left: 16px;
  padding-bottom: 40px;
`
