import { useState } from 'react'
import { ConnectWallet } from './Wallet'
import { ConnectUnlockAccount } from './UnlockAccount'
import { ConnectedWallet } from './ConnectedWallet'
import { useStorageService } from '~/utils/withStorageService'
import { UserAccountType } from '~/utils/userAccountType'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useConnectModal } from '~/hooks/useConnectModal'

interface SelectConnectMethodProps {
  connected: string | undefined
  onNext?: () => void
}

export const SelectConnectMethod = ({
  connected,
  onNext,
}: SelectConnectMethodProps) => {
  const [email, setEmail] = useState('')
  const [useUnlockAccount, setUseUnlockAccount] = useState(false)

  const [isValidEmail, setIsValidEmail] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)

  const storageService = useStorageService()

  const { openConnectModal } = useConnectModal()

  const verifyAndSetEmail = async (email: string) => {
    setIsVerifyingEmail(true)
    setEmail(email)
    try {
      const existingUser =
        (await storageService.getUserAccountType(email)) ===
        UserAccountType.UnlockAccount
      setIsValidEmail(existingUser)
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(`Email Error: ${error.message}`)
      }
    }
    setIsVerifyingEmail(false)
  }

  return (
    <div>
      {!useUnlockAccount && !connected && (
        <ConnectWallet
          isVerifyingEmail={isVerifyingEmail}
          onUnlockAccount={async (email) => {
            openConnectModal('unlock_account')
            await verifyAndSetEmail(email || '')
            setUseUnlockAccount(true)
          }}
        />
      )}
      {useUnlockAccount && !connected && !isVerifyingEmail && (
        <ConnectUnlockAccount
          defaultEmail={email}
          useIcon={false}
          isValidEmail={isValidEmail}
          onExit={() => {
            setEmail('')
            setUseUnlockAccount(false)
          }}
        />
      )}
      {connected && <ConnectedWallet showIcon={false} onNext={onNext} />}
    </div>
  )
}
