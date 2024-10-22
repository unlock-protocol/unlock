'use client'

import { useConnectModal } from '~/hooks/useConnectModal'
import { Modal } from '@unlock-protocol/ui'
import { ConnectWallet } from './Wallet'

export const ConnectModal = () => {
  const { closeConnectModal, open } = useConnectModal()

  return (
    <Modal isOpen={open} setIsOpen={closeConnectModal} size="small">
      <div className="z-10 w-full max-w-sm bg-white rounded-2xl">
        <ConnectWallet />
      </div>
    </Modal>
  )
}
