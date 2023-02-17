import { useAuth } from '~/contexts/AuthenticationContext'
import { DiAndroid as AndroidIcon, DiApple as AppleIcon } from 'react-icons/di'
import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Button, Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'
import { TransactionAnimation } from '../Shell'
import Link from 'next/link'
import { AddToDeviceWallet } from '../../keychain/AddToPhoneWallet'
import { Platform } from '~/services/ethpass'
import { isAndroid, isIOS } from 'react-device-detect'
import { useWeb3Service } from '~/utils/withWeb3Service'
interface Props {
  injectedProvider: unknown
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
  communication?: CheckoutCommunication
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
  const web3Service = useWeb3Service()
  const [tokenId, setTokenId] = useState()
  const { mint, lock, messageToSign } = state.context
  const processing = mint?.status === 'PROCESSING'
  const status = mint?.status

  useEffect(() => {
    const getTokenId = async () => {
      // Note: we only get the token id for the connected user.
      // If they purchased for someone else (or multiple folks), we only
      // want them to be able to install _their_ pass.
      const userTokenId = await web3Service.getTokenIdForOwner(
        lock!.address,
        account!,
        lock!.network
      )
      setTokenId(userTokenId)
    }
    if (mint?.status !== 'FINISHED' || !account || !lock || !web3Service) {
      return
    }
    getTokenId()
  }, [mint, account, lock, web3Service])

  useEffect(() => {
    if (mint?.status !== 'PROCESSING') {
      return
    }
    const waitForConfirmation = async () => {
      try {
        const network = config.networks[lock!.network]
        if (network) {
          const provider = new ethers.providers.JsonRpcBatchProvider(
            network.provider
          )

          const transaction = await provider.waitForTransaction(
            mint!.transactionHash!,
            2
          )

          if (transaction.status !== 1) {
            throw new Error('Transaction failed.')
          }

          communication?.emitTransactionInfo({
            hash: mint!.transactionHash!,
            lock: lock?.address,
          })

          communication?.emitUserInfo({
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

  const stepItems = useCheckoutSteps(checkoutService)

  return (
    <Fragment>
      <Stepper
        position={8}
        disabled
        service={checkoutService}
        items={stepItems}
      />
      <main className="h-full px-6 py-2 overflow-auto">
        <div className="flex flex-col items-center justify-center h-full space-y-2">
          <TransactionAnimation status={status} />
          <p className="text-lg font-bold text-brand-ui-primary">
            {content?.text}
          </p>
          {mint?.status === 'FINISHED' && tokenId && (
            <Link
              href="/keychain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
            >
              Open keychain
              <Icon icon={ExternalLinkIcon} size="small" />
            </Link>
          )}
          {mint?.transactionHash && (
            <a
              href={config.networks[lock!.network].explorer.urls.transaction(
                mint.transactionHash
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
            >
              See in the block explorer
              <Icon icon={ExternalLinkIcon} size="small" />
            </a>
          )}
          {tokenId && (
            <ul className="grid gap-2">
              {!isIOS && (
                <li className="">
                  <AddToDeviceWallet
                    className="w-full"
                    iconLeft={<AndroidIcon />}
                    size="small"
                    variant="secondary"
                    platform={Platform.GOOGLE}
                    as={Button}
                    network={lock!.network}
                    lockAddress={lock!.address}
                    tokenId={tokenId}
                    image={`${config.services.storage.host}/lock/${
                      lock!.address
                    }/icon`}
                    name={lock!.name}
                    handlePassUrl={(url: string) => {
                      window.open(url, '_')
                    }}
                  >
                    Add to Google wallet
                  </AddToDeviceWallet>
                </li>
              )}
              {!isAndroid && (
                <li className="">
                  <AddToDeviceWallet
                    className="w-full"
                    platform={Platform.APPLE}
                    size="small"
                    variant="secondary"
                    as={Button}
                    iconLeft={<AppleIcon />}
                    network={lock!.network}
                    lockAddress={lock!.address}
                    tokenId={tokenId}
                    image={`${config.services.storage.host}/lock/${
                      lock!.address
                    }/icon`}
                    name={lock!.name}
                    handlePassUrl={(url: string) => {
                      window.open(url, '_')
                    }}
                  >
                    Add to Apple wallet
                  </AddToDeviceWallet>
                </li>
              )}
            </ul>
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
