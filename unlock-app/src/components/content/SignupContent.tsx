/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
import React from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import LogInSignUp from '../interface/LogInSignUp'
import { AppLayout } from '../interface/layouts/AppLayout'

export const SignupContent = () => {
  return (
    <AppLayout title="Signup" authRequired={false} showLinks={false}>
      <Head>
        <title>{pageTitle('Signup')}</title>
      </Head>
      <LogInSignUp
        network={1} // TODO: figure out what/if network is really needed.
        embedded={false}
        signup={false}
        onCancel={() => {}}
      />
    </AppLayout>
  )
}

export default SignupContent
