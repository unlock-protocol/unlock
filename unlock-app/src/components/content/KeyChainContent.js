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
import Media from '../../theme/media'
import { DefaultError } from '../creator/FatalError'

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
  if (error) return <p>Error :c</p>

  if (data.keyHolders.length == 0) {
    return (
      <DefaultError
        title="Manage your keys here"
        illustration="/static/images/illustrations/lock.svg"
        critical={false}
      >
        The Keychain lets you view and manage the keys that you own. As soon as
        you have one, you&apos;ll see it on this page.
      </DefaultError>
    )
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
  padding: 16px;
  ${Media.phone`
width: 100%;
margin: 0 0 16px 0;
  `}
  ${Media.nophone`
width: 30%;
margin: 0 16px 16px 0;
  `}
  &:hover {
    border: thin #aaaaaa solid;
    box-shadow: 0px 0px 10px 3px rgba(221, 221, 221, 1);
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-width: 100%;
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

  /* Grey 4 */

  color: #333333;
  margin-top: 8px;
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
  margin-top: 8px;
`

const KeyExpiration = styled.div`
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 20px;
  color: #333333;
`
