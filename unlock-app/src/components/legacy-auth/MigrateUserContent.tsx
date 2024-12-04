'use client'

import { useState, useEffect } from 'react'
import { ConnectViaEmail } from './ConnectViaEmail'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { Tabs } from '@unlock-protocol/ui'
import MigrationFeedback from './MigrationFeedback'
import ConnectToPrivy from './ConnectToPrivy'
import { UserAccountType } from '~/utils/userAccountType'
import { SignInWithPassword } from './SignInWithPassword'
import { PromptSignOut } from './PromptSignOut'
import { usePrivy } from '@privy-io/react-auth'

export const MigrateUserContent = () => {
  const { user: privyUser } = usePrivy()
  const [userEmail, setUserEmail] = useState<string>('')
  const [walletPk, setWalletPk] = useState<string | null>(null)
  const [userAccountType, setUserAccountType] = useState<UserAccountType[]>([])
  const [isMigrating, setIsMigrating] = useState(false)
  const [privyConnected, setPrivyConnected] = useState(false)
  const [skipPrivyStep, setSkipPrivyStep] = useState(false)

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

  // Determine if the Privy step can be skipped
  useEffect(() => {
    if (privyUser && walletPk) {
      setPrivyConnected(true)
      setSkipPrivyStep(true)
    }
  }, [privyUser, walletPk])

  // Dynamically define the tabs
  const tabs = [
    {
      title: 'Enter your email',
      description: 'First, verify your email address',
      disabled: false,
      button: {
        disabled:
          checkPrivyUserMutation.isPending || checkUserAccountType.isPending,
      },
      children: ({ onNext }: { onNext: () => void }) => {
        return (
          <ConnectViaEmail
            email={privyUser?.email?.address || ''}
            onNext={({ email, accountType }) => {
              setUserEmail(email || privyUser?.email?.address || '')
              setUserAccountType(accountType)
              onNext()
            }}
          />
        )
      },
      showButton: false,
    },
    {
      title: 'Sign in to your account',
      description: 'Sign in to your existing Unlock account',
      disabled: !userEmail || checkPrivyUserMutation.isPending,
      children: ({ onNext }: { onNext: () => void }) => {
        if (userAccountType?.includes(UserAccountType.UnlockAccount)) {
          return (
            <SignInWithPassword
              userEmail={userEmail}
              onNext={(walletPk) => {
                setWalletPk(walletPk)
                onNext()
              }}
            />
          )
        }
        if (
          userAccountType?.includes(UserAccountType.EmailCodeAccount) ||
          userAccountType?.includes(UserAccountType.GoogleAccount)
        ) {
          return (
            <div className="space-y-4">
              <h2 className="text-xl font-bold">
                Account Migration Not Available
              </h2>
              <p>
                We apologize, but migration is currently only available for
                Unlock 1.0 accounts. Migration support for these account types
                has now been discontinued.
              </p>
            </div>
          )
        }
        return null
      },
    },
    // Conditionally include the Privy connection step
    ...(!skipPrivyStep
      ? [
          {
            title: 'Create a Privy Account',
            disabled: !walletPk,
            description: 'Create a Privy Account',
            children: ({ onNext }: { onNext: () => void }) => (
              <ConnectToPrivy
                userEmail={userEmail}
                onNext={onNext}
                setPrivyConnected={setPrivyConnected}
              />
            ),
            showButton: false,
          },
        ]
      : []),
    {
      title: 'Migration',
      disabled: !walletPk || (!privyConnected && !skipPrivyStep),
      description:
        'This is the last step! We will migrate your Unlock account to Privy!',
      children: (
        <MigrationFeedback
          walletPk={walletPk!}
          onMigrationStart={() => setIsMigrating(true)}
        />
      ),
      showButton: false,
    },
  ]

  return (
    <>
      <div className="md:px-28 mt-10">
        <div className="space-y-2 mb-20">
          <h2 className="text-2xl font-bold">Migrate your account</h2>
          <p>
            We are migrating Unlock Accounts to use our new Authentication
            provider, Privy. Please enter your email below to migrate your
            account.
          </p>
        </div>
        <Tabs tabs={tabs} />
      </div>

      {privyUser?.email?.address && privyUser?.wallet && !isMigrating && (
        <PromptSignOut />
      )}
    </>
  )
}

export default MigrateUserContent
