'use client'

import { useState, useRef } from 'react'
import { ConnectViaEmail, ConnectViaEmailRef } from './ConnectViaEmail'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { Tabs } from '@unlock-protocol/ui'
import MigrationFeedback from './MigrationFeedback'
import { SignInUnlockAccount, UserDetails } from './SignInAccount'
import { Wallet } from 'ethers'
import useAccount from '~/hooks/useAccount'
import { ToastHelper } from '../helpers/toast.helper'
import ConnectToPrivy from './ConnectToPrivy'
import { usePrivy } from '@privy-io/react-auth'
import { UserAccountType } from '~/utils/userAccountType'

export const MigrateUserContent = () => {
  const { retrieveUserAccount } = useAccount('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [walletPk, setWalletPk] = useState<string | null>(null)
  const [userAccountType, setUserAccountType] = useState<UserAccountType[]>([])
  const emailFormRef = useRef<ConnectViaEmailRef>(null)
  const { user } = usePrivy()

  const handleSignIn = async () => {
    if (!password) {
      ToastHelper.error('Password is required')
      throw new Error('Password is required')
    }
    try {
      const unlockProvider = await retrieveUserAccount(userEmail, password)
      // @ts-expect-error Property 'mnemonic' does not exist on type 'Wallet | HDNodeWallet'
      const wallet = Wallet.fromPhrase(unlockProvider.wallet.mnemonic.phrase)
      const privateKey = wallet.privateKey
      setWalletPk(privateKey)
    } catch (error) {
      console.error('Sign in error:', error)
      ToastHelper.error('Sign in failed. Please check your credentials.')
      throw error
    }
  }

  // Mutation to handle the user account type
  const checkUserAccountType = useMutation({
    mutationFn: async (email: string) => {
      const response = await locksmith.getUserAccountType(email)
      // Map the API response to our local enum
      const userAccountType =
        response.data.userAccountType?.map((type: string) => {
          switch (type) {
            case 'EMAIL_CODE':
              return UserAccountType.EmailCodeAccount
            case 'UNLOCK_ACCOUNT':
              return UserAccountType.UnlockAccount
            case 'GOOGLE_ACCOUNT':
              return UserAccountType.GoogleAccount
            case 'PASSKEY_ACCOUNT':
              return UserAccountType.PasskeyAccount
            default:
              throw new Error(`Unknown account type: ${type}`)
          }
        }) || []
      return userAccountType
    },
  })

  // Mutation to handle the Privy user check
  const checkPrivyUserMutation = useMutation({
    mutationFn: async (email: string) => {
      try {
        const privyUser = await locksmith.checkPrivyUser({ email })
        return privyUser.data.user
      } catch (error) {
        console.error('Error checking Privy user:', error)
      }
    },
  })

  return (
    <div className="px-28 mt-10">
      <div className="space-y-2 mb-20">
        <h2 className="text-2xl font-bold">Migrate your account</h2>
        <p>
          We are migrating Unlock Accounts to use our new Authentication
          provider, Privy. Please enter your email below to migrate your
          account.
        </p>
      </div>
      <Tabs
        tabs={[
          {
            title: 'Enter your email',
            description: 'First, verify your email address',
            disabled: false,
            button: {
              // Disable button during mutation
              disabled:
                checkPrivyUserMutation.isPending ||
                checkUserAccountType.isPending,
            },
            children: (
              <ConnectViaEmail
                email={userEmail}
                onEmailChange={setUserEmail}
                isLoadingUserExists={
                  checkPrivyUserMutation.isPending ||
                  checkUserAccountType.isPending
                }
                ref={emailFormRef}
              />
            ),
            onNext: async () => {
              // Handle form submission and Privy check
              await emailFormRef.current?.handleSubmit(async (data) => {
                const email = data.email.trim()
                if (!email) {
                  ToastHelper.error('Email is required')
                  throw new Error('Email is required')
                }

                setUserEmail(email)

                // Perform Privy user check first
                const privyUser =
                  await checkPrivyUserMutation.mutateAsync(email)
                if (privyUser) {
                  ToastHelper.error('Email already has a Privy account')
                }

                // Then check user account type
                const userAccountType =
                  await checkUserAccountType.mutateAsync(email)
                if (!userAccountType) {
                  ToastHelper.error('No account found for this email')
                  throw new Error('No account found for this email')
                }
                setUserAccountType(userAccountType)
              })()
            },
          },
          {
            title: 'Sign in to your account',
            description: 'Sign in to your existing Unlock account',
            disabled: !userEmail || checkPrivyUserMutation.isPending,
            children: (
              <SignInUnlockAccount
                email={userEmail}
                accountType={userAccountType}
                onSubmit={(data: UserDetails) => {
                  setPassword(data.password)
                }}
                setWalletPk={setWalletPk}
                useIcon={false}
              />
            ),
            onNext: async () => {
              // Handle sign in and proceed
              await handleSignIn()
            },
          },
          {
            title: 'Create a Privy Account',
            disabled: !walletPk,
            description: 'Create a Privy Account',
            children: userEmail ? (
              <ConnectToPrivy userEmail={userEmail} />
            ) : null,
            showButton: user ? true : false,
          },
          {
            title: 'Migrating',
            disabled: !walletPk,
            description: 'Migrating your account...',
            children: <MigrationFeedback walletPk={walletPk!} />,
            showButton: false,
          },
        ]}
      />
    </div>
  )
}

export default MigrateUserContent
