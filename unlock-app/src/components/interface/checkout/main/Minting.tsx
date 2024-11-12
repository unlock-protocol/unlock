import { CheckoutService } from './checkoutMachine'
import { Icon } from '@unlock-protocol/ui'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { useConfig } from '~/utils/withConfig'
import { Fragment, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSelector } from '@xstate/react'
import { useCheckoutCommunication } from '~/hooks/useCheckoutCommunication'
import { PoweredByUnlock } from '../PoweredByUnlock'
import { Stepper } from '../Stepper'
import { TransactionAnimation } from '../Shell'
import Link from 'next/link'
import type { Transaction } from './checkoutMachine'
import { ReturningButton } from '../ReturningButton'
import { AddToWallet } from '../../keychain/AddToWallet'
import { useGetTokenIdForOwner } from '~/hooks/useGetTokenIdForOwner'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface MintingScreenProps {
  lockName: string
  mint: Transaction
  owner: string
  lockAddress: string
  network: number
  states?: Record<string, { text: string }>
  pessimistic?: boolean
  isCompact?: boolean
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
  mint,
  owner,
  lockAddress,
  network,
  states = DEFAULT_STATES,
  pessimistic = false,
  isCompact = false,
}: MintingScreenProps) => {
  const config = useConfig()
  const transactionNetwork = mint.network || network

  // TODO: This returns the Key with the lowest index for given lock dddres from the onwer causing weird behaviour when buying 2-nd... keys
  const { data: tokenId } = useGetTokenIdForOwner(
    { account: owner!, lockAddress, network },
    {
      enabled: mint?.status === 'FINISHED',
    }
  )
  const hasTokenId = !!tokenId

  const status =
    mint?.status === 'PROCESSING' && !pessimistic ? 'FINISHED' : mint?.status

  return (
    <div className="flex flex-col items-center justify-evenly h-full space-y-2">
      <TransactionAnimation status={status} />
      {mint?.transactionHash && (
        <a
          href={config.networks[transactionNetwork].explorer.urls.transaction(
            mint.transactionHash
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-brand-ui-primary hover:opacity-75"
        >
          <p
            className={`text-lg font-bold text-brand-ui-primary inline-flex items-center gap-2 ${
              isCompact ? 'text-base text-center' : 'text-lg'
            }`}
          >
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
      {hasTokenId && (
        <AddToWallet
          network={network}
          lockAddress={lockAddress}
          tokenId={tokenId.toString()}
        />
      )}
    </div>
  )
}

interface MintingProps {
  checkoutService: CheckoutService
  onClose(params?: Record<string, string>): void
  communication?: ReturnType<typeof useCheckoutCommunication>
}

export function Minting({
  onClose,
  checkoutService,
  communication,
}: MintingProps) {
  const { account } = useAuthenticate()
  const { mint, lock, messageToSign, metadata, recipients, paywallConfig } =
    useSelector(checkoutService, (state) => state.context)

  const config = useConfig()
  const processing = mint?.status === 'PROCESSING' && paywallConfig.pessimistic
  const [doneWaiting, setDoneWaiting] = useState(false)
  const web3Service = useWeb3Service()

  useEffect(() => {
    if (!mint || doneWaiting) {
      return
    }
    const network = config.networks[mint!.network || lock!.network]
    if (!network) {
      return
    }
    const provider = new ethers.JsonRpcProvider(network.provider)

    const waitForTokenIds = async (): Promise<string[]> => {
      const tokenIds = await Promise.all(
        recipients.map((r: string) =>
          web3Service.latestTokenOfOwner(lock!.address, r, lock!.network)
        )
      )
      if (tokenIds.filter((tokenId?: string) => !!tokenId).length) {
        return tokenIds
      }
      return new Promise((resolve) =>
        setTimeout(() => {
          resolve(waitForTokenIds())
        }, 1000)
      )
    }

    const waitForConfirmation = async () => {
      try {
        const transaction = await provider.waitForTransaction(
          mint!.transactionHash!,
          1
        )

        if (!transaction || transaction.status !== 1) {
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
        checkoutService.send({
          type: 'CONFIRM_MINT',
          status: 'FINISHED',
          network: mint!.network,
          transactionHash: mint!.transactionHash!,
        })
      } catch (error) {
        if (error instanceof Error) {
          console.log('Error waiting for confirmation', error)
          ToastHelper.error(
            'There was an error while we waited for your NFT to be minted. Please refresh the page and try again if needed.'
          )
          checkoutService.send({
            type: 'CONFIRM_MINT',
            status: 'ERROR',
            network: mint!.network,
            transactionHash: mint!.transactionHash,
          })
        }
      }
      setDoneWaiting(true)
    }

    if (mint.status === 'PROCESSING') {
      setTimeout(() => {
        waitForConfirmation()
      }, 1000)
    }
  }, [mint?.status])

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
          pessimistic={!!paywallConfig.pessimistic}
        />
      </main>
      <footer className="grid items-center px-6 pt-6 border-t">
        <ReturningButton
          loading={processing}
          disabled={!account || processing}
          onClick={() => onClose()}
          checkoutService={checkoutService}
        />
        <PoweredByUnlock />
      </footer>
    </Fragment>
  )
}
