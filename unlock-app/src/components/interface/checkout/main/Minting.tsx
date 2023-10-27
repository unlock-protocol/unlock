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
import { TransactionAnimation } from '../Shell'
import Link from 'next/link'
import { AddToDeviceWallet } from '../../keychain/AddToPhoneWallet'
import { isEthPassSupported, Platform } from '~/services/ethpass'
import { isAndroid, isIOS } from 'react-device-detect'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import type { Transaction } from './checkoutMachine'
import { ReturningButton } from '../ReturningButton'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'
import { sleeper } from '~/utils/promise'

interface MintingScreenProps {
  lockName: string
  mint: Transaction
  owner: string
  lockAddress: string
  network: number
}

export const MintingScreen = ({
  lockName,
  mint,
  owner,
  lockAddress,
  network,
}: MintingScreenProps) => {
  const web3Service = useWeb3Service()
  const config = useConfig()
  const transactionNetwork = mint.network || network
  const { data: tokenId } = useQuery(
    ['userTokenId', mint, owner, lockAddress, transactionNetwork, web3Service],
    async () => {
      return web3Service.getTokenIdForOwner(
        lockAddress,
        owner!,
        transactionNetwork
      )
    },
    {
      enabled: mint?.status === 'FINISHED',
    }
  )
  const hasTokenId = !!tokenId

  const content = useMemo(() => {
    switch (mint?.status) {
      case 'PROCESSING': {
        return {
          title: 'Minting NFT',
          text: 'Minting NFT...',
        }
      }
      case 'FINISHED': {
        return {
          title: 'You have NFT!',
          text: 'Successfully minted NFT',
        }
      }
      case 'ERROR': {
        return {
          title: 'Minting failed',
          text: 'Failed to mint NFT',
        }
      }
    }
  }, [mint?.status])

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-2">
      <TransactionAnimation status={mint?.status} />
      <p className="text-lg font-bold text-brand-ui-primary">{content?.text}</p>
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
          href={config.networks[transactionNetwork].explorer.urls.transaction(
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
      {hasTokenId && isEthPassSupported(transactionNetwork) && (
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
                network={network}
                lockAddress={lockAddress}
                tokenId={tokenId}
                name={lockName}
                handlePassUrl={(url: string) => {
                  window.location.assign(url)
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
                network={network}
                lockAddress={lockAddress}
                tokenId={tokenId}
                name={lockName}
                handlePassUrl={(url: string) => {
                  window.location.assign(url)
                }}
              >
                Add to Apple Wallet
              </AddToDeviceWallet>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

interface MintingProps {
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
}: MintingProps) {
  const { account } = useAuth()
  const [state, send] = useActor(checkoutService)
  const config = useConfig()
  const { mint, lock, messageToSign, metadata, recipients } = state.context
  const processing = mint?.status === 'PROCESSING'

  useEffect(() => {
    if (mint?.status !== 'PROCESSING') {
      return
    }

    const waitForTokenIds = async (): Promise<string[]> => {
      const web3Service = new Web3Service(networks)

      const tokenIds = await Promise.all(
        recipients.map((r: string) =>
          web3Service.latestTokenOfOwner(lock!.address, r, lock!.network)
        )
      )
      if (tokenIds.filter((tokenId?: string) => !!tokenId).length) {
        return tokenIds
      }
      await sleeper(1000)
      return waitForTokenIds()
    }

    const waitForConfirmation = async () => {
      try {
        const network = config.networks[mint.network || lock!.network]
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

          const tokenIds = await waitForTokenIds()

          communication?.emitTransactionInfo({
            hash: mint!.transactionHash!,
            lock: lock?.address,
            tokenIds: tokenIds?.length ? tokenIds : [],
            metadata,
          })

          communication?.emitUserInfo({
            address: account,
            signedMessage: messageToSign?.signature,
          })

          communication?.emitMetadata(metadata)

          send({
            type: 'CONFIRM_MINT',
            status: 'FINISHED',
            network: mint!.network,
            transactionHash: mint!.transactionHash!,
          })
        }
      } catch (error) {
        if (error instanceof Error) {
          ToastHelper.error(error.message)
          send({
            type: 'CONFIRM_MINT',
            status: 'ERROR',
            network: mint!.network,
            transactionHash: mint!.transactionHash,
          })
        }
      }
    }
    waitForConfirmation()
  }, [
    mint,
    lock,
    config,
    send,
    communication,
    account,
    messageToSign,
    metadata,
  ])

  return (
    <Fragment>
      <Stepper disabled service={checkoutService} />
      <main className="h-full px-6 py-2 overflow-auto">
        <MintingScreen
          mint={mint!}
          owner={account!} // TODO: are we minting for someone else?
          lockAddress={lock!.address}
          lockName={lock!.name}
          network={lock!.network}
        ></MintingScreen>
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <Connected
          injectedProvider={injectedProvider}
          service={checkoutService}
        >
          <ReturningButton
            loading={processing}
            disabled={!account || processing}
            onClick={() => onClose()}
            checkoutService={checkoutService}
          />
        </Connected>
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
