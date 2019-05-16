import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'

export const SignupContent = () => {
  return (
    <GlobalErrorConsumer>
      <Layout title="Signup">
        <Head>
          <title>{pageTitle('Signup')}</title>
        </Head>
        <LogInSignUp signup />
      </Layout>
    </GlobalErrorConsumer>
  )
}

export default SignupContent
