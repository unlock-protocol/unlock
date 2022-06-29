import { useAuth } from '~/contexts/AuthenticationContext'
import { Mint, CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Icon } from '@unlock-protocol/ui'
import mintingAnimation from '~/animations/minting.json'
import mintedAnimation from '~/animations/minted.json'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { useEffect } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { Shell } from '../Shell'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
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

export function Minting({ injectedProvider, onClose, checkoutService }: Props) {
  const communication = useCheckoutCommunication()
  const { account } = useAuth()
  const config = useConfig()
  const [state, send] = useActor(checkoutService)
  const { mint, lock } = state.context
  const processing = mint?.status === 'PROCESSING'
  const status = mint?.status

  useEffect(() => {
    if (mint?.status !== 'PROCESSING') {
      return
    }
    async function waitForConfirmation() {
      try {
        const network = config.networks[lock!.network]
        if (network) {
          const provider = new ethers.providers.JsonRpcProvider(
            network.provider
          )
          await provider.waitForTransaction(mint!.transactionHash!)
          communication.emitTransactionInfo({
            hash: mint!.transactionHash!,
            lock: lock?.address,
          })
          send({
            type: 'CONFIRM_MINT',
            status: 'FINISHED',
            transactionHash: mint!.transactionHash!,
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          ToastHelper.error(error.message)
          send({
            type: 'CONFIRM_MINT',
            status: 'ERROR',
            transactionHash: mint!.transactionHash,
          })
        }
      }
    }
    waitForConfirmation()
  }, [mint, lock, config, send, communication])

  return (
    <Shell.Root onClose={() => onClose()}>
      <Shell.Head checkoutService={checkoutService} />
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
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <Button
            disabled={!account || processing}
            loading={processing}
            onClick={() => onClose()}
            className="w-full"
          >
            {processing ? 'Minting your membership' : 'Return to site'}
          </Button>
        </Connected>
      </footer>
    </Shell.Root>
  )
}
