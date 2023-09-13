import { Disclosure, Drawer, Tooltip } from '@unlock-protocol/ui'
import React, { ReactNode } from 'react'
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
import { MAX_UINT, UNLIMITED_RENEWAL_LIMIT } from '~/constants'
import relative from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import custom from 'dayjs/plugin/customParseFormat'
import { durationAsText } from '~/utils/durations'
import { storage } from '~/config/storage'
import { getEventDate, getEventEndDate } from '~/components/content/event/utils'
import { useWeb3Service } from '~/utils/withWeb3Service'

dayjs.extend(relative)
dayjs.extend(duration)
dayjs.extend(custom)

interface KeyItemProps {
  children: ReactNode
  label: string
}

export const KeyItem = ({ label, children }: KeyItemProps) => {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-bold">{children}</span>
    </div>
  )
}

interface KeyRenewalProps {
  possibleRenewals: string
  approvedRenewals: string
  balance: Record<'amount' | 'symbol', string>
}

const KeyRenewal = ({
  possibleRenewals,
  approvedRenewals,
  balance,
}: KeyRenewalProps) => {
  const possible = ethers.BigNumber.from(possibleRenewals)
  const approved = ethers.BigNumber.from(approvedRenewals)

  if (possible.lte(0)) {
    return (
      <KeyItem label="Renewals">
        Your balance of {balance.amount} {balance.symbol} is too low to renew
      </KeyItem>
    )
  }

  if (approved.lte(0)) {
    return <KeyItem label="Renewals">No renewals approved</KeyItem>
  }

  if (approved.gt(0) && approved.lte(UNLIMITED_RENEWAL_LIMIT)) {
    return <KeyItem label="Renewals">{approved.toString()} times</KeyItem>
  }

  if (approved.gt(UNLIMITED_RENEWAL_LIMIT)) {
    return <KeyItem label="Renewals">Renews unlimited times</KeyItem>
  }

  return <KeyItem label="Renewals">-</KeyItem>
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
  const web3Service = useWeb3Service()
  const provider = web3Service.providerForNetwork(network)
  const config = useConfig()
  const isERC20 =
    lock.tokenAddress &&
    lock.tokenAddress !== ethers.constants.AddressZero.toString()
  const { data: keyMetadata, isLoading: isKeyMetadataLoading } = useQuery(
    ['keyMetadata', lock, tokenId, network],
    async () => {
      const response = await storage.keyMetadata(network, lock.address, tokenId)
      return response.data || {}
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
        const response = await storage.getSubscription(
          network,
          lock.address,
          tokenId
        )
        return response.data.subscriptions
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
    keyMetadata?.attributes || []
  )

  // Primary subscription
  const subscription = subscriptions?.[0]

  const name = lock?.name
  const eventURL = getURL(ticket?.event_url)

  const isUserInfoNotAvailable =
    Object.keys(keyMetadata?.userMetadata?.protected || {}).length === 0 &&
    Object.keys(keyMetadata?.userMetadata?.public || {}).length === 0

  const isTicketInfoNotAvailable = Object.keys(ticket || {}).length === 0

  const starDate = getEventDate(ticket)
  const endDate = getEventEndDate(ticket)

  const isSameDay = dayjs(starDate).isSame(endDate, 'day')

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
          <KeyRenewal
            possibleRenewals={subscription.possibleRenewals!}
            approvedRenewals={subscription.approvedRenewals!}
            balance={subscription.balance as any}
          />
        )}
        {lock.expirationDuration !== MAX_UINT && (
          <KeyItem label="Renewal Duration">
            {durationAsText(lock.expirationDuration)}
          </KeyItem>
        )}
      </div>
      {!isTicketInfoNotAvailable && (
        <div>
          <h3 className="text-lg font-bold"> Event Information </h3>
          <div className="divide-y divide-brand-dark">
            {starDate && (
              <KeyItem label={isSameDay ? 'Event Date' : 'Event Start Date'}>
                {starDate?.toLocaleDateString(undefined, {
                  timeZone: ticket?.event_timezone,
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </KeyItem>
            )}
            {endDate && !isSameDay && (
              <KeyItem label="Event End Date">
                {endDate?.toLocaleDateString(undefined, {
                  timeZone: ticket?.event_timezone,
                  weekday: 'long',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </KeyItem>
            )}
            {ticket?.event_start_date && (
              <Tooltip
                delay={0}
                label={ticket.event_timezone}
                tip={ticket.event_timezone}
                side="bottom"
              >
                <KeyItem label={isSameDay ? 'Event Time' : 'Event Start Time'}>
                  <div className="flex gap-1">
                    <span>
                      {starDate?.toLocaleTimeString(
                        navigator.language || 'en-US',
                        {
                          timeZone: ticket.event_timezone,
                        }
                      )}
                    </span>
                    {isSameDay && (
                      <>
                        <span>to</span>
                        <span>
                          {endDate?.toLocaleTimeString(
                            navigator.language || 'en-US',
                            {
                              timeZone: ticket.event_timezone,
                            }
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </KeyItem>
              </Tooltip>
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
          <h3 className="text-lg font-bold"> User Information </h3>
          <div className="divide-y divide-brand-dark">
            {Object.entries(keyMetadata?.userMetadata?.public || {}).map(
              ([key, value]: any) => (
                <KeyItem label={key} key={key}>
                  {value || null}
                </KeyItem>
              )
            )}
            {Object.entries(keyMetadata?.userMetadata?.protected || {}).map(
              ([key, value]: any) => (
                <KeyItem label={key} key={key}>
                  {value || null}
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
