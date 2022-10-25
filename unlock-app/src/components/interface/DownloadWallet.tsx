import React from 'react'
import { Button, Modal } from '@unlock-protocol/ui'
import { RiWalletFill as WalletIcon } from 'react-icons/ri'
interface Props {
  isOpen: boolean
  setIsOpen: (option: boolean) => void
}

export function DownloadWallet({ isOpen, setIsOpen }: Props) {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="space-y-6 rounded">
        <p className="text-gray-600">
          Wallets give access to your funds and Ethereum applications. Only you
          should have access to your wallet.
        </p>
        <Button
          href="https://ethereum.org/en/wallets/find-wallet/"
          as="a"
          target="_blank"
          rel="noopener noreferrer"
          iconRight={<WalletIcon key="wallet" />}
        >
          Download wallet
        </Button>
      </div>
    </Modal>
  )
}
