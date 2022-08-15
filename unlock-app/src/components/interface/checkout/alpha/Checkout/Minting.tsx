import { useAuth } from '~/contexts/AuthenticationContext'
import { Mint, CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Icon } from '@unlock-protocol/ui'
import mintingAnimation from '~/animations/minting.json'
import mintedAnimation from '~/animations/minted.json'
import errorAnimation from '~/animations/error.json'
import Lottie from 'lottie-react'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { ProgressCircleIcon, ProgressFinishedIcon } from '../Progress'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
  communication: CheckoutCommunication
}

function AnimationContent({ status }: { status: Mint['status'] }) {
  const animationClass = `w-28 sm:w-36 h-28 sm:h-36`
  switch (status) {
    case 'PROCESSING':
      return (
        <Lottie
          className={animationClass}
          loop
          animationData={mintingAnimation}
        />
      )
    case 'FINISHED':
      return (
        <Lottie
          className={animationClass}
          loop
          animationData={mintedAnimation}
        />
      )
    case 'ERROR': {
      return (
        <Lottie className={animationClass} animationData={errorAnimation} />
      )
    }
    default:
      return null
  }
}

export function Minting({
  injectedProvider,
  onClose,
  checkoutService,
  communication,
}: Props) {
  const { account } = useAuth()
  const config = useConfig()
  const [state, send] = useActor(checkoutService)
  const { mint, lock, messageToSign } = state.context
  const processing = mint?.status === 'PROCESSING'
  const status = mint?.status

  useEffect(() => {
    if (mint?.status !== 'PROCESSING') {
      return
    }
    const waitForConfirmation = async () => {
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

          communication.emitUserInfo({
            address: account,
            signedMessage: messageToSign?.signature,
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
  }, [mint, lock, config, send, communication, account, messageToSign])

  const content = useMemo(() => {
    switch (status) {
      case 'PROCESSING': {
        return {
          title: 'Minting NFT',
          text: 'Purchasing NFT...',
        }
      }
      case 'FINISHED': {
        return {
          title: 'You have NFT!',
          text: 'Successfully purchased NFT',
        }
      }
      case 'ERROR': {
        return {
          title: 'Minting failed',
          text: 'Failed to purchase NFT',
        }
      }
    }
  }, [status])

  return (
    <Fragment>
      <div className="flex px-6 p-2 flex-wrap items-center w-full gap-2">
        <div className="flex items-center gap-2 col-span-4">
          <div className="flex items-center gap-0.5">
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            <ProgressCircleIcon disabled />
            {messageToSign && <ProgressCircleIcon disabled />}
            <ProgressCircleIcon disabled />
            <ProgressFinishedIcon />
          </div>
          <h4 className="text-sm"> {content?.title} </h4>
        </div>
        <div className="border-t-4 w-full flex-1"></div>
      </div>
      <main className="px-6 py-2 overflow-auto h-full">
        <div className="h-full flex flex-col items-center justify-center space-y-2">
          {status && <AnimationContent status={status} />}
          <p className="font-bold text-lg text-brand-ui-primary">
            {content?.text}
          </p>
          {mint?.transactionHash && (
            <a
              href={config.networks[lock!.network].explorer.urls.transaction(
                mint.transactionHash
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm inline-flex items-center gap-2 text-brand-ui-primary hover:opacity-75"
            >
              See in the block explorer
              <Icon icon={ExternalLinkIcon} size="small" />
            </a>
          )}
        </div>
      </main>
      <footer className="px-6 pt-6 border-t grid items-center">
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
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
