import React, { useContext } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { Heading, Description } from '../interface/SignupSuccess'
import LoginPrompt from '../interface/LoginPrompt'
import { AuthenticationContext } from '../../contexts/AuthenticationContext'

export const LoginContent = () => {
  const { account } = useContext(AuthenticationContext)

  return (
    <Layout title="Login">
      <Head>
        <title>{pageTitle('Login')}</title>
      </Head>
      {!account && <LoginPrompt unlockUserAccount />}
      {account && (
        <>
          <Heading>Login</Heading>

          <Description>
            You are now logged in! Visit{' '}
            <Link href="/settings">
              <a>your settings page</a>
            </Link>
            .
          </Description>
        </>
      )}
    </Layout>
  )
}

export default LoginContent
