import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutState, CheckoutSend, Mint } from './checkoutMachine'
import { PaywallConfig } from '~/unlockTypes'
import { Connected } from '../Connected'
import { Button, Icon } from '@unlock-protocol/ui'
import { useAuthenticateHandler } from '~/hooks/useAuthenticateHandler'
import mintingAnimation from '~/animations/minting.json'
import mintedAnimation from '~/animations/minted.json'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { useEffect } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'

interface Props {
  injectedProvider: unknown
  paywallConfig: PaywallConfig
  send: CheckoutSend
  onClose(): void
  state: CheckoutState
}

function AnimationContent({ status }: { status: Mint['status'] }) {
  switch (status) {
    case 'PROCESSING':
      return (
        <Lottie
          className="w-40 h-40"
          loop={true}
          animationData={mintingAnimation}
        />
      )
    case 'FINISHED':
      return (
        <Lottie
          className="w-40 h-40"
          loop={true}
          animationData={mintedAnimation}
        />
      )
    default:
      return null
  }
}

export function Minting({ injectedProvider, send, onClose, state }: Props) {
  const { account, deAuthenticate } = useAuth()
  const { authenticateWithProvider } = useAuthenticateHandler({
    injectedProvider,
  })
  const config = useConfig()
  const { mint, lock } = state.context
  const processing = mint?.status === 'PROCESSING'
  const status = mint?.status

  useEffect(() => {
    async function waitForConfirmation() {
      try {
        if (mint?.status !== 'PROCESSING') {
          return
        }
        const network = config.networks[lock!.network]
        if (network) {
          const provider = new ethers.providers.JsonRpcProvider(
            network.provider
          )
          await provider.waitForTransaction(mint.transactionHash!)
          send({
            type: 'CONFIRM_MINT',
            status: 'FINISHED',
            transactionHash: mint.transactionHash!,
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          ToastHelper.error(error.message)
          send({
            type: 'CONFIRM_MINT',
            status: 'ERROR',
          })
        }
      }
    }
    waitForConfirmation()
  }, [mint, lock, config, send])

  return (
    <div>
      <main className="p-6 overflow-auto h-64 sm:h-72">
        <div className="space-y-6 justify-center grid">
          {status && <AnimationContent status={status} />}
          <a
            href={config.networks[lock!.network].explorer.urls.transaction(
              mint?.transactionHash
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm inline-flex items-center gap-2 text-brand-ui-primary hover:opacity-75"
          >
            See in block explorer <Icon icon={ExternalLinkIcon} size="small" />
          </a>
        </div>
      </main>
      <footer className="p-6 border-t grid items-center">
        <Connected
          account={account}
          onDisconnect={() => {
            deAuthenticate()
            send('DISCONNECT')
          }}
          onUnlockAccount={() => {
            send('UNLOCK_ACCOUNT')
          }}
          authenticateWithProvider={authenticateWithProvider}
        >
          <Button
            disabled={!account || processing}
            loading={processing}
            onClick={onClose}
            className="w-full"
          >
            {processing ? 'Minting your membership' : 'Return to site'}
          </Button>
        </Connected>
      </footer>
    </div>
  )
}
