import { Disclosure, Drawer } from '@unlock-protocol/ui'
import { useStorageService } from '~/utils/withStorageService'
import React, { ReactNode } from 'react'
import { useWalletService } from '~/utils/withWalletService'
import { useQuery } from '@tanstack/react-query'
import { Property } from '../locks/metadata/custom/AddProperty'
import { Level } from '../locks/metadata/custom/AddLevel'
import { Stat } from '../locks/metadata/custom/AddStat'
import { categorizeAttributes } from '../locks/metadata/utils'
import LoadingIcon from '../Loading'
import {
  getErc20Decimals,
  getErc20TokenSymbol,
} from '@unlock-protocol/unlock-js'
import { ethers } from 'ethers'
import { useConfig } from '~/utils/withConfig'
import dayjs from 'dayjs'
import {
  AvatarImage,
  Root as Avatar,
  Fallback as AvatarFallback,
} from '@radix-ui/react-avatar'
import { RiExternalLinkFill as ExternalIcon } from 'react-icons/ri'
import { getURL } from '~/utils/url'
import { MAX_UINT } from '~/constants'
import relative from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import custom from 'dayjs/plugin/customParseFormat'
dayjs.extend(relative)
dayjs.extend(duration)
dayjs.extend(custom)

interface KeyItemProps {
  children: ReactNode
  label: string
}

const KeyItem = ({ label, children }: KeyItemProps) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-gray-500 capitalize">{label}</span>
      <span className="font-bold">{children}</span>
    </div>
  )
}

interface KeyInfoProps {
  tokenId: string
  network: number
  lock: any
  account: string
  expiration: string
  imageURL?: string
}

export const KeyInfo = ({
  tokenId,
  lock,
  network,
  account,
  expiration,
  imageURL,
}: KeyInfoProps) => {
  const storageService = useStorageService()
  const walletService = useWalletService()
  const provider = walletService.providerForNetwork(network)
  const config = useConfig()
  const isERC20 =
    lock.tokenAddress &&
    lock.tokenAddress !== ethers.constants.AddressZero.toString()
  const { data: keyMetadata, isLoading: isKeyMetadataLoading } = useQuery(
    ['keyMetadata', lock, tokenId, network],
    async () => {
      await storageService.loginPrompt({
        walletService,
        address: account!,
        chainId: network,
      })

      const response = await storageService.getKeyMetadataValues({
        lockAddress: lock.address,
        keyId: parseInt(tokenId),
        network,
      })

      return response || {}
    },
    {
      onError(error) {
        console.error(error)
      },
    }
  )

  const { data: keyPrice, isLoading: isKeyPriceLoading } = useQuery(
    ['keyPrice', lock.address, network],
    async () => {
      if (isERC20) {
        const [symbol, decimals] = await Promise.all([
          getErc20TokenSymbol(lock.tokenAddress, provider),
          getErc20Decimals(lock.tokenAddress, provider),
        ])
        const amount = ethers.utils.formatUnits(lock.price, decimals)
        return {
          amount,
          symbol,
          decimals,
        }
      } else {
        const native = config.networks[network]?.nativeCurrency
        const decimals = native.decimals
        const amount = ethers.utils.formatUnits(
          lock.price,
          native.decimals || 18
        )
        const symbol = native.symbol || ''
        return {
          amount,
          symbol,
          decimals,
        }
      }
    }
  )

  const { data: subscriptions, isInitialLoading: isSubscriptionsLoading } =
    useQuery(
      ['subscriptions', lock.address, tokenId, network],
      async () => {
        storageService.loginPrompt({
          walletService,
          address: account!,
          chainId: 1,
        })
        const response = await storageService.getSubscription({
          network: network,
          lockAddress: lock.address,
          keyId: tokenId,
        })
        return response.subscriptions
      },
      {
        retry: 0,
        enabled: !!(lock?.address && account),
        onError(error) {
          console.error(error)
        },
      }
    )

  const isLoading =
    isKeyMetadataLoading && isKeyPriceLoading && isSubscriptionsLoading

  if (isLoading) {
    return <LoadingIcon />
  }

  const { ticket, properties, stats, levels } = categorizeAttributes(
    keyMetadata?.attributes
  )

  // Primary subscription
  const subscription = subscriptions?.[0]

  const name = lock?.name
  const eventURL = getURL(ticket?.event_url)

  const isUserInfoNotAvailable =
    Object.keys(keyMetadata?.userMetadata?.protected || {}).length === 0 &&
    Object.keys(keyMetadata?.userMetadata?.public || {}).length === 0

  const isTicketInfoNotAvailable = Object.keys(ticket || {}).length === 0

  return (
    <div className="grid gap-6">
      <header className="flex flex-col items-center w-full gap-6">
        <Avatar className="flex items-center justify-center">
          <AvatarImage
            className="w-full h-full max-w-80 max-h-80 aspect-1 rounded-xl"
            alt={name}
            src={imageURL || keyMetadata?.image}
            width={250}
            height={250}
          />
          <AvatarFallback
            className="w-80 h-80 aspect-1 rounded-xl"
            delayMs={100}
          >
            <img src="/images/lock-placeholder.png" alt={name} />
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">{name}</h1>
      </header>
      <div className="divide-y divide-brand-dark">
        <KeyItem label="Token ID">{tokenId}</KeyItem>
        <KeyItem label="Network">{config.networks[network].name}</KeyItem>
        {expiration !== MAX_UINT &&
          dayjs.unix(parseInt(expiration)).isAfter(dayjs()) && (
            <KeyItem label="Expire on">
              {dayjs.unix(parseInt(expiration)).format('MMM D, YYYY h:mm A')}
            </KeyItem>
          )}
        {keyPrice && keyPrice.amount !== '0.0' && (
          <KeyItem label="Price">
            {`${keyPrice.amount} ${keyPrice.symbol}`}
          </KeyItem>
        )}
        {subscription && (
          <KeyItem label="Renewals">
            {subscription.possibleRenewals <= 0
              ? 'Renewal will not happen due to low balance'
              : subscription.approvedRenewals <= 0
              ? 'No renewals approved.'
              : `Renew ${subscription.approvedRenewals} times`}
          </KeyItem>
        )}
        {lock.expirationDuration !== MAX_UINT && (
          <KeyItem label="Renewal Duration">
            {dayjs
              .duration(
                ethers.BigNumber.from(lock.expirationDuration)
                  .div(86400)
                  .toNumber(),
                'day'
              )
              .humanize()}
          </KeyItem>
        )}
      </div>
      {!isTicketInfoNotAvailable && (
        <div>
          <h3 className="text-lg font-bold"> Event Information </h3>
          <div className="divide-y divide-brand-dark">
            {!!ticket?.event_start_time && (
              <KeyItem label="Event Time">
                {dayjs(ticket.event_start_time, ['HH:mm', 'h:mm']).format(
                  'h:mm A'
                )}
              </KeyItem>
            )}
            {ticket?.event_start_date && (
              <KeyItem label="Event Date">
                {new Date(ticket.event_start_date).toDateString()}
              </KeyItem>
            )}
            {ticket?.event_address && (
              <KeyItem label="Event Address">{ticket.event_address}</KeyItem>
            )}
            {eventURL && (
              <KeyItem label="Event Link">
                <a
                  target="_blank"
                  className="inline-flex items-center gap-2"
                  rel="noreferrer"
                  href={eventURL.toString()}
                >
                  {eventURL.hostname}
                  <ExternalIcon size={18} />
                </a>
              </KeyItem>
            )}
          </div>
        </div>
      )}

      {!isUserInfoNotAvailable && (
        <div>
          <h3 className="text-lg font-bold"> User information </h3>
          <div className="divide-y divide-brand-dark">
            {Object.entries(keyMetadata?.userMetadata?.public || {}).map(
              ([key, value]) => (
                <KeyItem label={key} key={key}>
                  {value}
                </KeyItem>
              )
            )}
            {Object.entries(keyMetadata?.userMetadata?.protected || {}).map(
              ([key, value]) => (
                <KeyItem label={key} key={key}>
                  {value}
                </KeyItem>
              )
            )}
          </div>
        </div>
      )}
      <div className="grid gap-6">
        {!!properties?.length && (
          <Disclosure label="Properties">
            <div className="flex flex-wrap items-center gap-2">
              {properties.map((item) => (
                <Property key={item.trait_type} {...item} />
              ))}
            </div>
          </Disclosure>
        )}
        {!!levels?.length && (
          <Disclosure label="Levels">
            <div className="flex flex-wrap items-center gap-2">
              {levels.map((item) => (
                <Level key={item.trait_type} {...item} />
              ))}
            </div>
          </Disclosure>
        )}
        {!!stats?.length && (
          <Disclosure label="Stats">
            <div className="flex flex-wrap items-center gap-2">
              {stats.map((item) => (
                <Stat key={item.trait_type} {...item} />
              ))}
            </div>
          </Disclosure>
        )}
      </div>
    </div>
  )
}

interface KeyInfoDrawerProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  tokenId: string
  network: number
  lock: any
  account: string
  expiration: string
  imageURL?: string
}

export const KeyInfoDrawer = ({
  isOpen,
  setIsOpen,
  lock,
  tokenId,
  network,
  account,
  expiration,
  imageURL,
}: KeyInfoDrawerProps) => {
  return (
    <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
      <KeyInfo
        account={account}
        lock={lock}
        tokenId={tokenId}
        network={network}
        expiration={expiration}
        imageURL={imageURL}
      />
    </Drawer>
  )
}
