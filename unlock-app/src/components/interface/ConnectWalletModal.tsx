import { Modal } from '@unlock-protocol/ui'
import { useConnectModal } from '~/hooks/useConnectModal'

interface ConnectWalletModalPros {
  isOpen: boolean
  setIsOpen: (state: boolean) => void
}

export const ConnectWalletModal = ({
  isOpen,
  setIsOpen,
}: ConnectWalletModalPros) => {
  const { openConnectModal } = useConnectModal()
  return (
    <div className="flex flex-col items-center justify-center min-w-full min-h-screen p-3 overflow-auto bg-opacity-50 backdrop-filter backdrop-blur-sm bg-zinc-500">
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col items-center justify-center gap-3">
          <img
            src="/images/illustrations/connect-wallet.svg"
            alt="Connect wallet"
          />
          <span className="text-base font-bold">
            Please{' '}
            <button
              onClick={(event) => {
                event.preventDefault()
                openConnectModal()
              }}
            >
              <span className="cursor-pointer text-brand-ui-primary">
                connect{' '}
              </span>
            </button>
            your wallet to continue
          </span>
        </div>
      </Modal>
    </div>
  )
}
