import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Authenticate from '../interface/Authenticate'
import SignupSuccess from '../interface/SignupSuccess'

export const LoginContent = () => {
  return (
    <Layout title="Login">
      <Head>
        <title>{pageTitle('Login')}</title>
      </Head>
      <Authenticate unlockUserAccount>
        <SignupSuccess />
      </Authenticate>
    </Layout>
  )
}

export default LoginContent
