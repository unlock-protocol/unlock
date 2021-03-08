import React from 'react'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import Authenticate from '../interface/Authenticate'
import KeyDetails from '../interface/keychain/KeyDetails'

export const KeychainContent = () => {
  return (
    <Layout title="Member Keychain">
      <Head>
        <title>{pageTitle('Member Keychain')}</title>
      </Head>
      <Authenticate unlockUserAccount>
        <BrowserOnly>
          <Account />
          <KeyDetails />
        </BrowserOnly>
      </Authenticate>
    </Layout>
  )
}
export default KeychainContent
