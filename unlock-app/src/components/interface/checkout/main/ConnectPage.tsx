import { CheckoutService } from './checkoutMachine'
import { LoginModal, usePrivy } from '@privy-io/react-auth'
import { IoIosWarning as WarningIcon } from 'react-icons/io'
import { useEffect, useState } from 'react'
import { Button } from '@unlock-protocol/ui'
import { checkLegacyAccount } from '~/config/PrivyProvider'
import MigrateUserCheckout from '~/components/legacy-auth/MigrateUserCheckout'

interface ConnectPageProps {
  style: string
  checkoutService?: CheckoutService
  showPrivyModal: boolean
}

export const ConnectPage = ({
  style,
  checkoutService,
  showPrivyModal,
}: ConnectPageProps) => {
  const [showLegacyMessage, setShowLegacyMessage] = useState(false)
  const [showMigrationSteps, setShowMigrationSteps] = useState(false)
  const { user, logout: privyLogout } = usePrivy()

  const handleSignOut = async () => {
    await privyLogout()
    setShowMigrationSteps(false)
    setShowLegacyMessage(false)
    checkoutService?.send({ type: 'SELECT' })
  }

  useEffect(() => {
    // check if the user has a legacy account
    const ascertainUserAccountType = async () => {
      if (user && !user.wallet?.address) {
        if (user.email?.address) {
          const hasLegacyAccount = await checkLegacyAccount(user.email?.address)
          setShowLegacyMessage(hasLegacyAccount)
        }
      }
    }
    ascertainUserAccountType()
  }, [user?.email?.address, user?.wallet?.address, user])

  if (showMigrationSteps) {
    return (
      <MigrateUserCheckout
        userEmail={user?.email?.address || ''}
        onSignOut={handleSignOut}
      />
    )
  }

  if (showLegacyMessage) {
    return (
      <div className="flex flex-col gap-4 text-center p-6">
        <div className="flex justify-center">
          <WarningIcon className="h-8 w-8 text-yellow-500" />
        </div>
        <h2 className="text-xl font-bold">Legacy Account Detected</h2>
        <p>
          We&apos;ve detected that you have an existing Unlock account that
          needs to be migrated. Please proceed to migrate your account.
        </p>

        <div className="flex justify-center">
          <Button onClick={() => setShowMigrationSteps(true)}>
            Migrate Account
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className={style}>
      <LoginModal open={showPrivyModal} />
    </main>
  )
}
