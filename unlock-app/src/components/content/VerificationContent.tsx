import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getMembershipVerificationConfig } from '~/utils/verification'
import { useStorageService } from '~/utils/withStorageService'
import { useWalletService } from '~/utils/withWalletService'
import { pageTitle } from '../../constants'
import LocksContext from '../../contexts/LocksContext'
import { ToastHelper } from '../helpers/toast.helper'
import Account from '../interface/Account'
import Layout from '../interface/Layout'
import { Scanner } from '../interface/verification/Scanner'
import VerificationStatus from '../interface/VerificationStatus'

export const VerificationContent: React.FC<unknown> = () => {
  const { query } = useRouter()
  const [locks, setLocks] = useState({})
  const storageService = useStorageService()
  const walletService = useWalletService()
  const { account, network } = useAuth()
  const router = useRouter()

  const membershipVerificationConfig = getMembershipVerificationConfig({
    data: query.data?.toString(),
    sig: query.sig?.toString(),
  })

  useEffect(() => {
    const login = async () => {
      if (
        account &&
        network &&
        walletService &&
        !storageService.isAuthenticated
      ) {
        const promise = storageService.loginPrompt({
          walletService,
          address: account,
          chainId: network,
        })
        await ToastHelper.promise(promise, {
          error: 'Failed to login',
          success: 'Successfully logged in',
          loading: 'Please sign message from your wallet to login.',
        })
      }
    }
    login()
  }, [storageService, walletService, account, network])

  if (!membershipVerificationConfig) {
    return (
      <Layout title="Verification">
        <Head>
          <title>{pageTitle('Verification')}</title>
        </Head>
        <Account />
        <main>
          <Scanner />
        </main>
      </Layout>
    )
  }

  const addLock = (lock: any) => {
    return setLocks({
      ...locks,
      [lock.address]: lock,
    })
  }

  return (
    <Layout title="Verification">
      <Head>
        <title>{pageTitle('Verification')}</title>
      </Head>
      <Account />
      <LocksContext.Provider
        value={{
          locks,
          addLock,
        }}
      >
        <VerificationStatus
          config={membershipVerificationConfig}
          onVerified={() => {
            router.push('/verification')
          }}
        />
      </LocksContext.Provider>
    </Layout>
  )
}

export default VerificationContent
