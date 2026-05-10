// ABOUTME: Renders the Privy LoginModal inside an Unlock UI Modal wrapper.
// Visibility is controlled by ConnectModalProvider via useConnectModal.
'use client'

import { Modal } from '@unlock-protocol/ui'
import { LoginModal } from '@privy-io/react-auth'
import { useConnectModal } from '~/hooks/useConnectModal'

export function ConnectModal() {
  const { open, closeConnectModal } = useConnectModal()

  return (
    <Modal isOpen={open} setIsOpen={closeConnectModal} size="small">
      <div className="w-full max-w-sm rounded-2xl bg-white">
        <LoginModal open={open} />
      </div>
    </Modal>
  )
}
