'use client'

import { useConnectModal } from '~/hooks/useConnectModal'
import { Modal } from '@unlock-protocol/ui'
import { LoginModal } from '@privy-io/react-auth'

export const ConnectModal = () => {
  const { closeConnectModal, open } = useConnectModal()

  return (
    <Modal isOpen={open} setIsOpen={closeConnectModal} size="small">
      <div className="z-10 w-full max-w-sm bg-white rounded-2xl">
        <LoginModal open={open} />
      </div>
    </Modal>
  )
}
