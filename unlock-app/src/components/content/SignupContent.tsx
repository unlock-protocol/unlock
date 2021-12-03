/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'

export const SignupContent = () => {
  return (
    <Layout title="Signup">
      <Head>
        <title>{pageTitle('Signup')}</title>
      </Head>
      <LogInSignUp
        network={1} // TODO: figure out what/if network is really needed.
        embedded={false}
        signup
        onCancel={() => {}}
      />
    </Layout>
  )
}

export default SignupContent
