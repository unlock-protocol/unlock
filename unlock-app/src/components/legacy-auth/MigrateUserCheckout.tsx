'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import MigrationFeedback from './MigrationFeedback'
import { UserAccountType } from '~/utils/userAccountType'
import { SignInWithPassword } from './SignInWithPassword'
import { SignInWithCode } from './SignInWithCode'
import { SignInWithGoogle } from './SignInWithGoogle'
import { Placeholder } from '@unlock-protocol/ui'

interface MigrateUserCheckoutProps {
  userEmail: string
  onSignOut: () => Promise<void>
}

export const MigrateUserCheckout = ({
  userEmail,
  onSignOut,
}: MigrateUserCheckoutProps) => {
  const [walletPk, setWalletPk] = useState<string | null>(null)
  const [userAccountType, setUserAccountType] = useState<UserAccountType[]>([])

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

  // trigger the mutation when component loads
  useEffect(() => {
    if (userEmail) {
      checkUserAccountType.mutate(userEmail, {
        onSuccess: (types) => {
          setUserAccountType(types)
        },
      })
    }
  }, [userEmail])

  const renderAuthComponent = () => {
    if (checkUserAccountType.isPending) {
      return (
        <Placeholder.Root>
          <Placeholder.Line />
          <Placeholder.Line />
          <Placeholder.Line />
        </Placeholder.Root>
      )
    }

    if (userAccountType?.includes(UserAccountType.UnlockAccount)) {
      return <SignInWithPassword userEmail={userEmail} onNext={setWalletPk} />
    }
    if (userAccountType?.includes(UserAccountType.EmailCodeAccount)) {
      return <SignInWithCode email={userEmail} onNext={setWalletPk} />
    }
    if (userAccountType?.includes(UserAccountType.GoogleAccount)) {
      return <SignInWithGoogle onNext={setWalletPk} />
    }
    return null
  }

  return (
    <div className="px-6 mt-4 flex flex-col gap-4">
      {!walletPk && (
        <div className="flex flex-col gap-4">
          <p className=" text-gray-700 text-sm">
            You are migrating the account <span className="">{userEmail}</span>.
            Please enter your password.{' '}
            <span
              onClick={onSignOut}
              className=" text-brand-ui-primary underline cursor-pointer"
            >
              Sign out
            </span>
          </p>
          {renderAuthComponent()}
        </div>
      )}

      {walletPk && <MigrationFeedback mode="checkout" walletPk={walletPk} />}
    </div>
  )
}

export default MigrateUserCheckout
