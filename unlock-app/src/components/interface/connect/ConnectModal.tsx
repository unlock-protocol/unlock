'use client'

import { useAuth } from '~/contexts/AuthenticationContext'
import { useConnectModal } from '~/hooks/useConnectModal'
import ConnectWalletComponent from './ConnectWalletComponent'
import { Modal } from '@unlock-protocol/ui'

export const ConnectModal = () => {
  const { status, closeConnectModal, open } = useConnectModal()
  const { connected } = useAuth()

  const useUnlockAccount = status === 'unlock_account'

  return (
    <Modal isOpen={open} setIsOpen={closeConnectModal} size="small">
      <div className="z-10 w-full max-w-sm bg-white rounded-2xl">
        <header>
          <div className="flex px-1">
            <div className="flex-1 font-bold ">
              <h1 className="text-center">
                {!connected
                  ? 'Connect Account'
                  : useUnlockAccount
                    ? 'Unlock Account'
                    : 'Connected Wallet'}
              </h1>
            </div>
          </div>
        </header>
        <ConnectWalletComponent shoudOpenConnectModal={true} />
      </div>
    </Modal>
  )
}
