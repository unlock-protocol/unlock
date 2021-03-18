import React, { useContext } from 'react'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import KeyDetails from '../interface/keychain/KeyDetails'
import { AuthenticationContext } from '../interface/Authenticate'
import LoginPrompt from '../interface/LoginPrompt'

export const KeychainContent = () => {
  const { account } = useContext(AuthenticationContext)
  return (
    <Layout title="Member Keychain">
      <Head>
        <title>{pageTitle('Member Keychain')}</title>
      </Head>
      {!account && <LoginPrompt unlockUserAccount />}
      {account && (
        <>
          <BrowserOnly>
            <Account />
            <KeyDetails />
          </BrowserOnly>
        </>
      )}
    </Layout>
  )
}
export default KeychainContent
