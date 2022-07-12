import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { Heading, Description } from '../interface/SignupSuccess'
import LoginPrompt from '../interface/LoginPrompt'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useRouter } from 'next/router'

export const LoginContent = () => {
  const { account } = useAuth()
  const router = useRouter()
  const redirect = router.query?.redirect?.toString()

  useEffect(() => {
    if (redirect && account) {
      router.push(redirect)
    }
  }, [account, redirect, router])

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
            You are now logged in.{' '}
            <Link href={redirect || '/settings'}>
              {redirect ? 'Go back' : 'Visit Settings'}
            </Link>
            .
          </Description>
        </>
      )}
    </Layout>
  )
}

export default LoginContent
