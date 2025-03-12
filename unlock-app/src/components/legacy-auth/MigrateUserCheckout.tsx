'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { locksmith } from '~/config/locksmith'
import MigrationFeedback from './MigrationFeedback'
import { SignInWithPassword } from './SignInWithPassword'
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
  const [isUnlockAccount, setIsUnlockAccount] = useState<boolean>(false)

  // Mutation to handle the user account type
  const checkUserAccountType = useMutation({
    mutationFn: async (email: string) => {
      const response = await locksmith.getUserAccountType(email)
      // Check if user has an Unlock 1.0 account type
      return response.data.userAccountType?.includes('UNLOCK_ACCOUNT') || false
    },
  })

  // trigger the mutation when component loads
  useEffect(() => {
    if (userEmail) {
      checkUserAccountType.mutate(userEmail, {
        onSuccess: (isUnlock) => {
          setIsUnlockAccount(isUnlock)
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

    if (isUnlockAccount) {
      return <SignInWithPassword userEmail={userEmail} onNext={setWalletPk} />
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
