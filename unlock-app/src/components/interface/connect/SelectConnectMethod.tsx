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
  const [useEmail, setUseEmail] = useState(false)

  const [accountType, setAccountType] = useState<UserAccountType>(
    UserAccountType.None
  )
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)

  const storageService = useStorageService()

  const { openConnectModal } = useConnectModal()

  const verifyAndSetEmail = async (email: string) => {
    setIsVerifyingEmail(true)
    setEmail(email)
    try {
      const existingUser = await storageService.getUserAccountType(email)
      setAccountType(existingUser)
    } catch (error) {
      if (error instanceof Error) {
        ToastHelper.error(`Email Error: ${error.message}`)
      }
    }
    setIsVerifyingEmail(false)
  }

  return (
    <div>
      {!useEmail && !connected && (
        <ConnectWallet
          isVerifyingEmail={isVerifyingEmail}
          onUnlockAccount={async (email) => {
            openConnectModal('unlock_account')
            await verifyAndSetEmail(email || '')
            setUseEmail(true)
          }}
        />
      )}
      {useEmail && !connected && !isVerifyingEmail && (
        <ConnectUnlockAccount
          defaultEmail={email}
          useIcon={false}
          accountType={accountType}
          onExit={() => {
            openConnectModal('crypto')
            setEmail('')
            setUseEmail(false)
          }}
        />
      )}
      {connected && <ConnectedWallet showIcon={false} onNext={onNext} />}
    </div>
  )
}
