import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import Errors from '../interface/Errors'

export const LoginContent = () => {
  return (
    <Layout title="Login">
      <Head>
        <script src="https://storage.googleapis.com/terminal-sdk/metamask/latest/metamask-latest.min.js"></script>
        <title>{pageTitle('Login')}</title>
      </Head>
      <Errors />
      <LogInSignUp login />
    </Layout>
  )
}

export default LoginContent
