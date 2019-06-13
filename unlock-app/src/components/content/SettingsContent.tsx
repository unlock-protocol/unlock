import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'
import AccountInfo from '../interface/account-settings/AccountInfo'
import ChangePassword from '../interface/account-settings/ChangePassword'

export const SettingsContent = () => {
  return (
    <Layout title="Account Settings">
      <Head>
        <title>{pageTitle('Account Settings')}</title>
      </Head>
      <Errors />
      <AccountInfo />
      <ChangePassword />
    </Layout>
  )
}

export default SettingsContent
