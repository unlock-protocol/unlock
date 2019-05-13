import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'

export const LoginContent = () => {
  return (
    <GlobalErrorConsumer>
      <Layout title="Login">
        <Head>
          <title>{pageTitle('Login')}</title>
        </Head>
        <LogInSignUp login />
      </Layout>
    </GlobalErrorConsumer>
  )
}

export default LoginContent
