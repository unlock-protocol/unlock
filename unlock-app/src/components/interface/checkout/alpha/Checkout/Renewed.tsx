import { useAuth } from '~/contexts/AuthenticationContext'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useEffect, useMemo } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { StepItem, Stepper } from '../Stepper'
import { TransactionAnimation } from '../Shell'

interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
  communication: CheckoutCommunication
}

export function Renewed({
  injectedProvider,
  onClose,
  checkoutService,
  communication,
}: Props) {
  const { account } = useAuth()
  const config = useConfig()
  const [state, send] = useActor(checkoutService)
  const { renewed, lock, messageToSign } = state.context
  const { status: renewStatus, transactionHash } = renewed!
  const processing = renewStatus === 'PROCESSING'

  useEffect(() => {
    if (renewStatus !== 'PROCESSING') {
      return
    }
    const waitForConfirmation = async () => {
      try {
        const network = config.networks[lock!.network]
        if (network && transactionHash) {
          const provider = new ethers.providers.JsonRpcProvider(
            network.provider
          )
          await provider.waitForTransaction(transactionHash)
          communication.emitTransactionInfo({
            hash: transactionHash,
            lock: lock?.address,
          })
          communication.emitUserInfo({
            address: account,
            signedMessage: messageToSign?.signature,
          })
          send({
            type: 'CONFIRM_RENEW',
            status: 'FINISHED',
            transactionHash,
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          ToastHelper.error(error.message)
          send({
            type: 'CONFIRM_RENEW',
            status: 'ERROR',
            transactionHash,
          })
        }
      }
    }
    waitForConfirmation()
  }, [
    renewStatus,
    transactionHash,
    lock,
    config,
    send,
    communication,
    account,
    messageToSign,
  ])

  const content = useMemo(() => {
    switch (renewStatus) {
      case 'PROCESSING': {
        return {
          title: 'Renewing NFT',
          text: 'Renewing NFT...',
        }
      }
      case 'FINISHED': {
        return {
          title: 'You have renewed!',
          text: 'Successfully renewed NFT',
        }
      }
      case 'ERROR': {
        return {
          title: 'Renewal failed',
          text: 'Failed to renew NFT',
        }
      }
    }
  }, [renewStatus])

  const stepItems: StepItem[] = [
    {
      id: 1,
      name: 'Select lock',
      to: 'SELECT',
    },
    {
      id: 2,
      name: 'Renew membership',
      to: 'RENEW',
    },
    {
      id: 3,
      name: 'Renewed!',
    },
  ]

  return (
    <Fragment>
      <Stepper
        position={3}
        disabled
        service={checkoutService}
        items={stepItems}
      />
      <main className="h-full px-6 py-2 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <TransactionAnimation status={renewStatus} />
          <p className="text-lg font-bold text-brand-ui-primary">
            {content?.text}
          </p>
          {transactionHash && (
            <a
              href={config.networks[lock!.network].explorer.urls.transaction(
                transactionHash
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
            >
              See in the block explorer
              <Icon icon={ExternalLinkIcon} size="small" />
            </a>
          )}
        </div>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
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
