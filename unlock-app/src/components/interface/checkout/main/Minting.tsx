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
import { Stepper } from '../Stepper'
import { useCheckoutSteps } from './useCheckoutItems'
import { TransactionAnimation } from '../Shell'
import Link from 'next/link'
import { AddToDeviceWallet } from '../../keychain/AddToPhoneWallet'
import { isEthPassSupported, Platform } from '~/services/ethpass'
import { isAndroid, isIOS } from 'react-device-detect'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
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
  const { mint, lock, messageToSign } = state.context
  const processing = mint?.status === 'PROCESSING'
  const status = mint?.status

  const { data: tokenId } = useQuery(
    ['userTokenId', mint, account, lock, web3Service],
    async () => {
      return web3Service.getTokenIdForOwner(
        lock!.address,
        account!,
        lock!.network
      )
    },
    {
      enabled: mint?.status === 'FINISHED',
    }
  )

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

  const tokenImage = `${config.services.storage.host}/lock/${
    lock!.address
  }/icon?id=${tokenId}`

  const hasTokenId = !!tokenId

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
          {mint?.status === 'FINISHED' && hasTokenId && (
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
          {hasTokenId && isEthPassSupported(lock!.network) && (
            <ul className="grid grid-cols-2 gap-3 pt-4">
              {!isIOS && (
                <li className="">
                  <AddToDeviceWallet
                    className="w-full px-2 h-8 text-xs grid grid-cols-[20px_1fr] rounded-md bg-black text-white"
                    iconLeft={
                      <Image
                        width="20"
                        height="20"
                        alt="Google Wallet"
                        src={`/images/illustrations/google-wallet.svg`}
                      />
                    }
                    size="small"
                    variant="secondary"
                    platform={Platform.GOOGLE}
                    as={Button}
                    network={lock!.network}
                    lockAddress={lock!.address}
                    tokenId={tokenId}
                    image={tokenImage}
                    name={lock!.name}
                    handlePassUrl={(url: string) => {
                      window.open(url, '_')
                    }}
                  >
                    Add to Google Wallet
                  </AddToDeviceWallet>
                </li>
              )}
              {!isAndroid && (
                <li className="">
                  <AddToDeviceWallet
                    className="w-full px-2 h-8 text-xs grid grid-cols-[20px_1fr] rounded-md bg-black text-white"
                    platform={Platform.APPLE}
                    size="small"
                    variant="secondary"
                    as={Button}
                    iconLeft={
                      <Image
                        className="justify-self-left"
                        width="20"
                        height="20"
                        alt="Apple Wallet"
                        src={`/images/illustrations/apple-wallet.svg`}
                      />
                    }
                    network={lock!.network}
                    lockAddress={lock!.address}
                    tokenId={tokenId}
                    image={tokenImage}
                    name={lock!.name}
                    handlePassUrl={(url: string) => {
                      window.open(url, '_')
                    }}
                  >
                    Add to Apple Wallet
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
