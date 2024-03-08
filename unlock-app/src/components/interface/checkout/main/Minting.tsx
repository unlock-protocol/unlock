import { CheckoutService } from './checkoutMachine'
import { Connected } from '../Connected'
import { Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useEffect } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useActor } from '@xstate/react'
import { CheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { TransactionAnimation } from '../Shell'
import Link from 'next/link'
import { isEthPassSupported } from '~/services/ethpass'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import type { Transaction } from './checkoutMachine'
import { ReturningButton } from '../ReturningButton'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'
import { sleeper } from '~/utils/promise'
import { useAuth } from '~/contexts/AuthenticationContext'
import { AddToWallet } from '../../keychain/AddToWallet'

interface MintingScreenProps {
  lockName: string
  mint: Transaction
  owner: string
  lockAddress: string
  network: number
  states?: Record<string, { text: string }>
}

const DEFAULT_STATES = {
  PROCESSING: {
    text: 'Minting NFT...',
  },
  FINISHED: {
    text: 'Successfully minted NFT',
  },
  ERROR: {
    text: 'Failed to mint NFT',
  },
}

export const MintingScreen = ({
  lockName,
  mint,
  owner,
  lockAddress,
  network,
  states = DEFAULT_STATES,
}: MintingScreenProps) => {
  const web3Service = useWeb3Service()
  const config = useConfig()
  const transactionNetwork = mint.network || network

  // TODO: This returns the Key with the lowest index for given lock dddres from the onwer causing weird behaviour when buying 2-nd... keys
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

  return (
    <div className="flex flex-col items-center justify-evenly h-full space-y-2">
      <TransactionAnimation status={mint?.status} />
      {mint?.transactionHash && (
        <a
          href={config.networks[transactionNetwork].explorer.urls.transaction(
            mint.transactionHash
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
        >
          <p className="text-lg font-bold text-brand-ui-primary inline-flex items-center gap-2">
            {/* 
            This is not ideal realization, at least it works
            mint.status === 'FINISHED' before the transaction is confirmed on chan
             */}
            {mint?.status === 'FINISHED' && !hasTokenId // TODO: Fix mint status
              ? 'Minting NFT...'
              : states[mint?.status]?.text}
            <Icon icon={ExternalLinkIcon} size="small" />
          </p>
        </a>
      )}
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
      {hasTokenId && isEthPassSupported(transactionNetwork) && (
        <AddToWallet
          network={network}
          lockAddress={lockAddress}
          tokenId={tokenId.toString()}
          tokenName={lockName}
        />
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
