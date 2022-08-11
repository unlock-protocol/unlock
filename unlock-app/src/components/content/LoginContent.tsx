import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Layout from '../interface/Layout'
import { pageTitle } from '../../constants'
import { Heading, Description } from '../interface/SignupSuccess'
import LoginPrompt from '../interface/LoginPrompt'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useNavigate, useSearch } from '@tanstack/react-location'

export const LoginContent = () => {
  const { account } = useAuth()
  const navigate = useNavigate()
  const search = useSearch()
  const redirect = search.redirect as string

  useEffect(() => {
    // auto redirect to previous page
    if (redirect && account) {
      navigate({
        to: redirect,
      })
    }
  }, [account, redirect, navigate])

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
