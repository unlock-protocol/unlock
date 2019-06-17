import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Errors from '../interface/Errors'

export const UsersContent = () => {
  return (
    <Layout title="Users">
      <Head>
        <title>{pageTitle('Users')}</title>
        <script src="https://js.stripe.com/v3/" />
      </Head>
      <Errors />
    </Layout>
  )
}

export default UsersContent
