import React, { useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { pageTitle } from '../../constants'
import LoginPrompt from '../interface/LoginPrompt'
import { useAuth } from '../../contexts/AuthenticationContext'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'

export const LoginContent = () => {
  const { account } = useAuth()
  const router = useRouter()
  const redirect = router.query?.redirect?.toString()

  useEffect(() => {
    // auto redirect to previous page
    if (redirect && account) {
      router.push(redirect)
    }
  }, [account, redirect, router])

  return (
    <AppLayout showLinks={false} authRequired={false} title="Login">
      <Head>
        <title>{pageTitle('Login')}</title>
      </Head>
      {!account && <LoginPrompt unlockUserAccount />}
      {account && (
        <>
          <span className="text-base">
            You are now logged in.{' '}
            <Link className="" href={redirect || '/settings'}>
              <span className="underline text-brand-ui-primary">
                {redirect ? 'Go back' : 'Visit Settings'}
              </span>
            </Link>
            .
          </span>
        </>
      )}
    </AppLayout>
  )
}

export default LoginContent
