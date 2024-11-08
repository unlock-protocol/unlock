'use client'

import { useState } from 'react'
import { ConnectViaEmail } from './ConnectViaEmail'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import { Tabs } from '@unlock-protocol/ui'
import MigrationFeedback from './MigrationFeedback'
import ConnectToPrivy from './ConnectToPrivy'
import { UserAccountType } from '~/utils/userAccountType'
import { SignInWithPassword } from './SignInWithPassword'
import { SignInWithCode } from './SignInWithCode'
import { SignInWithGoogle } from './SignInWithGoogle'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { PromptSignOut } from './PromptSignOut'

export const MigrateUserContent = () => {
  const { account } = useAuthenticate()
  const [userEmail, setUserEmail] = useState<string>('')
  const [walletPk, setWalletPk] = useState<string | null>(null)
  const [userAccountType, setUserAccountType] = useState<UserAccountType[]>([])
  // Track migration status
  const [isMigrating, setIsMigrating] = useState(false)
  // Track Privy connection status
  const [privyConnected, setPrivyConnected] = useState(false)

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
              children: ({ onNext }) => {
                // Goal of this component is to get user email address + type of account
                // It should also check if there is a Privy account already.
                // If not, it "yields" the email account + type to the next step
                return (
                  <ConnectViaEmail
                    onNext={({ email, accountType }) => {
                      setUserEmail(email)
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
              children: ({ onNext }) => {
                // This component is in charge of getting a private key for
                // any account used
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
                  userAccountType?.includes(UserAccountType.EmailCodeAccount)
                ) {
                  return (
                    <SignInWithCode
                      email={userEmail}
                      onNext={(walletPk) => {
                        setWalletPk(walletPk)
                        onNext()
                      }}
                    />
                  )
                }
                if (userAccountType?.includes(UserAccountType.GoogleAccount)) {
                  return (
                    <SignInWithGoogle
                      onNext={(walletPk) => {
                        setWalletPk(walletPk)
                        onNext()
                      }}
                    />
                  )
                }
                return null
              },
            },
            {
              title: 'Create a Privy Account',
              disabled: !walletPk,
              description: 'Create a Privy Account',
              children: ({ onNext }) => (
                <ConnectToPrivy
                  userEmail={userEmail}
                  onNext={onNext}
                  setPrivyConnected={setPrivyConnected}
                />
              ),
              showButton: false,
            },
            {
              title: 'Migration',
              disabled: !walletPk || !privyConnected,
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
          ]}
        />
      </div>

      {account && !isMigrating && <PromptSignOut />}
    </>
  )
}

export default MigrateUserContent
