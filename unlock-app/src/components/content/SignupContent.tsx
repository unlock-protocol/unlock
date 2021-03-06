/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import Authenticate from '../interface/Authenticate'
import LogInSignUp from '../interface/LogInSignUp'

export const SignupContent = () => {
  return (
    <Layout title="Signup">
      <Head>
        <title>{pageTitle('Signup')}</title>
      </Head>
      <Authenticate requiredNetwork="1" optional>
        <LogInSignUp
          embedded={false}
          signup
          onProvider={() => {}}
          onCancel={() => {}}
        />
      </Authenticate>
    </Layout>
  )
}

export default SignupContent
