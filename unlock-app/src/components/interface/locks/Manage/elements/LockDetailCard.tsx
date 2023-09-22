import { addressMinify } from '~/utils/strings'
import { BiCopy as CopyIcon } from 'react-icons/bi'
import { HiOutlineExternalLink as ExternalLinkIcon } from 'react-icons/hi'
import { Button, Detail, Placeholder, Tooltip } from '@unlock-protocol/ui'
import useClipboard from 'react-use-clipboard'
import React, { useEffect, useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useQuery } from '@tanstack/react-query'
import { UNLIMITED_KEYS_COUNT, UNLIMITED_KEYS_DURATION } from '~/constants'
import { useConfig } from '~/utils/withConfig'
import { LockIcon } from './LockIcon'
import Duration from '~/components/helpers/Duration'
import useLock from '~/hooks/useLock'
import Link from 'next/link'
import { storage } from '~/config/storage'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useLockManager } from '~/hooks/useLockManager'
interface LockDetailCardProps {
  network: number
  lockAddress: string
}

interface LockInfoCardProps {
  name: string
  lockAddress: string
  network: number
  loading?: boolean
  version?: string
}

const LockInfoCard = ({
  name,
  lockAddress,
  network,
  loading,
  version,
}: LockInfoCardProps) => {
  const { networks } = useConfig()
  const [isCopied, setCopied] = useClipboard(lockAddress, {
    successDuration: 2000,
  })

  useEffect(() => {
    if (!isCopied) return
    ToastHelper.success(`Address copied`)
  }, [isCopied])

  const { explorer } = networks?.[network] ?? {}

  const explorerUrl = explorer?.urls?.address(lockAddress) || '#'

  if (loading)
    return (
      <>
        <Placeholder.Root spaced="sm">
          <Placeholder.Line size="lg" />
          <Placeholder.Root inline>
            <Placeholder.Line size="sm" width="md" />
            <Placeholder.Line size="sm" width="sm" />
          </Placeholder.Root>
        </Placeholder.Root>
      </>
    )

  return (
    <>
      <span className="text-4xl font-bold text-black">{name}</span>
      <div className="flex items-center gap-2.5">
        <div>
          <Tooltip
            tip={`Lock version ${version}`}
            label={`Lock version ${version}`}
            side="bottom"
          >
            <span className="font-medium rounded-full px-2.5 py-1 inline-flex items-center gap-2 text-xs bg-ui-main-50 text-brand-ui-primary">
              v.{version}
            </span>
          </Tooltip>
        </div>

        <span className="text-base">{addressMinify(lockAddress)}</span>
        <Button variant="borderless" onClick={setCopied} aria-label="copy">
          <CopyIcon size={20} />
        </Button>
        <a href={explorerUrl} target="_blank" rel="noreferrer">
          <Button
            variant="transparent"
            className="p-0 m-0"
            aria-label="external link"
          >
            <ExternalLinkIcon size={20} className="text-brand-ui-primary" />
          </Button>
        </a>
      </div>
    </>
  )
}

export const LockDetailCard = ({
  lockAddress,
  network,
}: LockDetailCardProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()

  const [isRecurring, setIsRecurring] = useState(false)

  const { isManager } = useLockManager({
    lockAddress,
    network,
  })

  const { isStripeConnected } = useLock({ address: lockAddress }, network)

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { isLoading, data: lock } = useQuery(
    ['getLock', lockAddress, network],
    async () => getLock()
  )

  const { isLoading: isLoadingStripe, data: isConnected = 0 } = useQuery(
    [],
    async () => {
      return isStripeConnected()
    }
  )

  const recurringPossible =
    lock?.expirationDuration != -1 &&
    lock?.publicLockVersion >= 10 &&
    lock?.currencyContractAddress?.length > 0

  useEffect(() => {
    if (lock?.publicLockVersion >= 11) {
      setIsRecurring(recurringPossible)
    } else {
      setIsRecurring(recurringPossible && lock?.selfAllowance !== '0')
    }
  }, [lock?.publicLockVersion, lock?.selfAllowance, recurringPossible])

  const { keyPrice, maxNumberOfKeys, expirationDuration } = lock ?? {}

  const { name: networkName, nativeCurrency } = networks?.[network] ?? {}
  const numbersOfKeys =
    maxNumberOfKeys === UNLIMITED_KEYS_COUNT ? 'Unlimited' : maxNumberOfKeys
  const duration =
    expirationDuration === UNLIMITED_KEYS_DURATION ? (
      'Unlimited'
    ) : (
      <Duration seconds={expirationDuration} />
    )

  const loading = isLoading || isLoadingStripe

  const symbol = lock?.currencySymbol || nativeCurrency?.symbol
  const priceLabel =
    keyPrice == 0 ? 'FREE' : Number(parseFloat(keyPrice)).toLocaleString()

  const { data: lockMetadata, isInitialLoading: isLockMetadataLoading } =
    useQuery<Record<string, any>>(
      ['lockMetadata', lockAddress, network],
      async () => {
        const response = await storage.lockMetadata(network, lockAddress)
        return response.data
      },
      {
        onError(error) {
          console.error(error)
        },
        retry: 2,
        initialData: {},
      }
    )

  const settingsPageUrl = `/locks/settings?address=${lockAddress}&network=${network}`
  const metadataPageUrl = `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-2">
          <div className="grid gap-2">
            <LockIcon
              lockAddress={lockAddress}
              network={network}
              loading={loading}
            />
            {isManager && (
              <p className="p-2 text-sm leading-tight text-gray-500 ">
                Need to update the icon? Use the{' '}
                <Link
                  href={metadataPageUrl}
                  className="text-brand-ui-primary hover:underline"
                >
                  Metadata Editor
                </Link>
              </p>
            )}
          </div>
          <LockInfoCard
            lockAddress={lockAddress}
            network={network}
            name={lockMetadata?.name || lock?.name}
            loading={loading}
            version={lock?.publicLockVersion}
          />
          {!isLockMetadataLoading && (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-24">
              {lockMetadata?.external_url && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={lockMetadata.external_url}
                  className=" text-ui-main-500 hover:underline"
                >
                  {lockMetadata.external_url}
                </a>
              )}
              {lockMetadata?.description && (
                <p className="text-gray-700 ">{lockMetadata.description}</p>
              )}
            </div>
          )}
          <div className="flex flex-col mt-6 divide-y divide-black">
            <div className="py-2">
              <Detail label="Network" loading={loading} inline>
                {networkName}
              </Detail>
            </div>
            <div className="py-2">
              <Detail label="Key Duration" loading={loading} inline>
                {duration}
              </Detail>
            </div>
            <div className="py-2">
              <Detail label="Keys for sale" loading={loading} inline>
                {numbersOfKeys}
              </Detail>
            </div>
            <div className="py-2">
              <Detail label="Price" loading={loading} inline>
                <div className="flex items-center gap-2">
                  <CryptoIcon symbol={symbol} />
                  <span>{priceLabel}</span>
                </div>
              </Detail>
            </div>
            <div className="py-2">
              <Detail label="Recurring" loading={loading} inline>
                {isRecurring ? 'YES' : 'NO'}
              </Detail>
            </div>
            <div className="py-2">
              <Detail label="Credit Card Payment" loading={loading} inline>
                {isConnected === 1 ? 'YES' : 'NO'}
              </Detail>
            </div>
          </div>
          {isManager && (
            <div className="mt-8">
              <span className="text-sm leading-tight text-gray-500">
                Need to update terms?{' '}
                <Link href={settingsPageUrl}>
                  <span className="font-semibold cursor-pointer text-brand-ui-primary">
                    Click here
                  </span>
                </Link>{' '}
                to update your contract&apos;s settings.
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
