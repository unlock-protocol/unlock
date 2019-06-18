import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/user-account/AccountInfo'
import ChangePassword from '../interface/user-account/ChangePassword'

export const SettingsContent = () => {
  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
        <script src="https://js.stripe.com/v3/"></script>
      </Head>
      <Errors />
      <AccountInfo />
      <ChangePassword />
    </Layout>
  )
}

export default SettingsContent
