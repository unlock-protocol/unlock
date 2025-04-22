import { LoginModal as ExportModal } from '@privy-io/react-auth'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { SettingCard } from '../locks/Settings/elements/SettingCard'
import { usePrivy } from '@privy-io/react-auth'
import { Button, Modal } from '@unlock-protocol/ui'
import { useState } from 'react'

export const ExportPrivateKey = () => {
  const { account } = useAuthenticate()
  const [showExportModal, setShowExportModal] = useState(false)

  const { exportWallet, authenticated, user } = usePrivy()
  const exportFromPrivy = async () => {
    setShowExportModal(true)
    await exportWallet({
      address: account!,
    })
  }

  return (
    <SettingCard
      label="Export Private Key"
      description="Export your private key to access your account from other wallets."
      defaultOpen={true}
    >
      <div className="space-y-5 mt-5">
        <Modal
          isOpen={showExportModal}
          setIsOpen={setShowExportModal}
          size="small"
        >
          <ExportModal open={showExportModal} />
        </Modal>

        <Button
          onClick={exportFromPrivy}
          disabled={
            !authenticated || user?.wallet?.walletClientType !== 'privy'
          }
        >
          Export my wallet
        </Button>
      </div>
    </SettingCard>
  )
}
