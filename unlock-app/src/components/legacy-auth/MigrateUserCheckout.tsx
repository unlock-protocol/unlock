'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import MigrationFeedback from './MigrationFeedback'
import { UserAccountType } from '~/utils/userAccountType'
import { SignInWithPassword } from './SignInWithPassword'
import { SignInWithCode } from './SignInWithCode'
import { SignInWithGoogle } from './SignInWithGoogle'

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
      return <div>Loading account details...</div>
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
    <div className="px-4 space-y-16 mt-4">
      <div>
        <h3 className="text-sm text-center">
          Migrating <span className="font-bold text-md">{userEmail}</span>
        </h3>
        <p
          onClick={onSignOut}
          className="text-sm text-center text-brand-ui-primary underline cursor-pointer"
        >
          Sign out
        </p>
      </div>

      {!walletPk && (
        <div className="space-y-2">
          <p className="text-center">Sign in to your existing Unlock account</p>
          {renderAuthComponent()}
        </div>
      )}

      {walletPk && <MigrationFeedback mode="checkout" walletPk={walletPk} />}
    </div>
  )
}

export default MigrateUserCheckout
