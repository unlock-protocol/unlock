import React from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import Layout from '../interface/Layout'
import LogInSignUp from '../interface/LogInSignUp'
import Errors from '../interface/Errors'

export const SignupContent = () => {
  return (
    <Layout title="Signup">
      <Head>
        <title>{pageTitle('Signup')}</title>
      </Head>
      <Errors />
      <LogInSignUp signup />
    </Layout>
  )
}

export default SignupContent
