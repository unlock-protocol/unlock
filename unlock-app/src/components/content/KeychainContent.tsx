import React from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import KeyDetails from '../interface/keychain/KeyDetails'

import { AppLayout } from '../interface/layouts/AppLayout'

export const KeychainContent = () => {
  return (
    <AppLayout
      title="Member Keychain"
      description="A Key is a membership NFT created on Unlock Protocol"
    >
      <Head>
        <title>{pageTitle('Member Keychain')}</title>
      </Head>
      <KeyDetails />
    </AppLayout>
  )
}
export default KeychainContent
