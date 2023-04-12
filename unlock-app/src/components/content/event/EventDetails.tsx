import fontColorContrast from 'font-color-contrast'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useMetadata } from '~/hooks/metadata'
import { useConfig } from '~/utils/withConfig'
import { selectProvider } from '~/hooks/useAuthenticate'
import LoadingIcon from '~/components/interface/Loading'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Button, Icon, Modal } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { AddressLink } from '~/components/interface/AddressLink'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'
import { getEventDate, getEventEndDate } from './utils'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'
import dayjs from 'dayjs'
import { WalletlessRegistration } from './WalletlessRegistration'
import { useIsClaimable } from '~/hooks/useIsClaimable'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { FiMapPin as MapPinIcon } from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useValidKey } from '~/hooks/useKey'
import { getLockTypeByMetadata } from '@unlock-protocol/core'
import { HiOutlineTicket as TicketIcon } from 'react-icons/hi'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { ethers } from 'ethers'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { useLockData } from '~/hooks/useLockData'
import { useQueries } from '@tanstack/react-query'
import networks from '@unlock-protocol/networks'
import { useGetLockSymbol } from '~/hooks/useSymbol'
import { useGetPrice } from '~/hooks/usePrice'

interface EventDetailsProps {
  lockAddress: string
  network: number
}

interface EventDetailProps {
  icon: IconType
  label: string
  children?: ReactNode
}

const EventDetail = ({ label, icon, children }: EventDetailProps) => {
  return (
    <div className="flex gap-4">
      <div className="flex w-16 h-16 bg-white border border-gray-200 rounded-2xl">
        <Icon className="m-auto" icon={icon} size={32} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-bold text-black">{label}</span>
        <div>{children}</div>
      </div>
    </div>
  )
}

export const EventDetails = ({ lockAddress, network }: EventDetailsProps) => {
  const { account } = useAuth()
  const web3service = useWeb3Service()

  const config = useConfig()
  const { lock } = useLockData({
    lockAddress,
    network,
  })

  const { data: symbol } = useGetLockSymbol({
    lockAddress,
    network,
    contractAddress: lock?.currencyContractAddress,
  })

  const { data: priceTest } = useGetPrice({
    network,
    amount: lock?.keyPrice || 0,
    currencyContractAddress: lock?.currencyContractAddress || undefined,
  })

  const tokenAddress =
    lock?.currencyContractAddress || networks?.[network].nativeCurrency.symbol
  const lockKeyPrice = lock?.keyPrice || 0

  const getKeyPrice = async () => {
    const decimals = await web3service.getTokenDecimals(tokenAddress, network)
    return ethers.utils.formatUnits(lockKeyPrice, decimals)
  }

  console.log('tokenAddress', symbol, priceTest, lock?.keyPrice)
  const [{ isLoading: loadingPrice, data: keyPrice }] = useQueries({
    queries: [
      {
        queryKey: ['getKeyPrice', lockAddress, network, tokenAddress],
        queryFn: async () => await getKeyPrice(),
      },
    ],
  })

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })
  const { isLoading: isClaimableLoading, isClaimable } = useIsClaimable({
    lockAddress,
    network,
  })

  const { data: hasValidKey, isInitialLoading: isHasValidKeyLoading } =
    useValidKey({
      lockAddress,
      network,
      account,
    })

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const { isEvent } = getLockTypeByMetadata(metadata)

  if (isMetadataLoading || isHasValidKeyLoading) {
    return <LoadingIcon />
  }

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  if (!isEvent) {
    if (isLockManager) {
      return (
        <>
          <p className="mb-2">
            Your event details are not set. Please make sure you add a date,
            time and location.
          </p>
          <Button
            onClick={onEdit}
            variant="black"
            className="w-32 border"
            size="small"
          >
            Edit Details
          </Button>
        </>
      )
    }
    return <p>This contract is not configured.</p>
  }

  const eventData = toFormData(metadata!)
  const eventDate = getEventDate(eventData.ticket)
  const eventEndDate = getEventEndDate(eventData.ticket)

  const isSameDay = dayjs(eventDate).isSame(eventEndDate, 'day')

  const injectedProvider = selectProvider(config)

  const paywallConfig = {
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
      },
    },
  }

  const startDate = eventDate
    ? eventDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const startTime =
    eventDate && eventData.ticket?.event_start_time
      ? eventDate.toLocaleTimeString(navigator.language || 'en-US', {
          timeZone: eventData.ticket.event_timezone,
        })
      : undefined

  const endDate =
    eventEndDate && eventEndDate && !isSameDay
      ? eventEndDate.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const endTime =
    eventDate && eventData.ticket?.event_end_time && eventEndDate && isSameDay
      ? eventEndDate.toLocaleTimeString(navigator.language || 'en-US', {
          timeZone: eventData.ticket.event_timezone,
        })
      : null

  const hasLocation = (eventData?.ticket?.event_address || '')?.length > 0

  return (
    <div>
      <Modal
        isOpen={isCheckoutOpen && !isClaimable}
        setIsOpen={setCheckoutOpen}
        empty={true}
      >
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={paywallConfig}
          handleClose={() => setCheckoutOpen(false)}
        />
      </Modal>

      <div className="relative">
        <div className="relative h-28 md:h-80 bg-slate-200 rounded-3xl">
          <div className="absolute z-10 bottom-3 right-3 md:bottom-8 nd:right-9">
            <Button variant="secondary" size="tiny">
              Upload Image
            </Button>
          </div>
          <div className="absolute flex flex-col w-full gap-6 px-4 md:px-10 -bottom-12">
            <section className="flex justify-between">
              <div className="flex w-24 h-24 p-2 bg-white md:w-48 md:h-48 rounded-3xl">
                <img
                  alt={eventData.title}
                  className="w-full m-auto aspect-1"
                  src={eventData.image}
                />
              </div>
              <ul className="flex items-center gap-4 mt-auto">
                <li>
                  <AddToCalendarButton event={eventData} />
                </li>
                <li>
                  <TweetItButton event={eventData} />
                </li>
              </ul>
            </section>
          </div>
        </div>

        <section className="grid items-start grid-cols-3 mt-14 md:px-12 md:mt-28">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="text-4xl font-bold md:text-7xl">{eventData.name}</h1>
            <div className="flex gap-2 flex-rows">
              <span className="text-brand-gray">Ticket contract</span>
              <AddressLink
                lockAddress={lockAddress}
                network={network}
              ></AddressLink>
            </div>
            <section className="mt-1">
              <div className="grid grid-cols-1 gap-6 md:p-6 md:grid-cols-2 rounded-2xl">
                {
                  <EventDetail label="Date & Time" icon={CalendarIcon}>
                    <div
                      style={{ color: `#${eventData.background_color}` }}
                      className="flex flex-col text-lg font-normal capitalize text-brand-dark"
                    >
                      <span>
                        {startDate} {endDate && <>to {endDate}</>}
                      </span>
                      <span>
                        {startTime} {endTime && <>to {endTime}</>}
                      </span>
                    </div>
                  </EventDetail>
                }
                {hasLocation && (
                  <EventDetail label="Location" icon={MapPinIcon}>
                    <div
                      style={{ color: `#${eventData.background_color}` }}
                      className="flex flex-col gap-0.5"
                    >
                      <span className="text-lg font-normal capitalize text-brand-dark">
                        {eventData.ticket?.event_address}
                      </span>
                      <Link
                        target="_blank"
                        className="text-base font-bold"
                        href={`https://www.google.com/maps/search/?api=1&query=${eventData.ticket?.event_address}`}
                      >
                        Show map
                      </Link>
                    </div>
                  </EventDetail>
                )}
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-bold">Event Information</h2>
                {eventData.description && (
                  <div className="mt-4 markdown">
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <ReactMarkdown children={eventData.description} />
                  </div>
                )}
              </div>
            </section>
          </div>
          {!hasValidKey && !isCheckoutOpen && (
            <div className="flex flex-col col-span-3 gap-6 p-6 bg-white border border-gray-200 md:col-span-1 rounded-3xl">
              <span className="text-2xl font-bold text-gray-900">
                Registration
              </span>
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <>
                    {symbol && <CryptoIcon symbol={symbol} size={30} />}
                    <span>{keyPrice}</span>
                  </>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon={TicketIcon} size={30} />
                  <span className="text-base font-bold">29</span>
                  <span className="text-gray-600">Left</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="medium"
                style={{
                  backgroundColor: `#${eventData.background_color}`,
                  color: `#${eventData.background_color}`
                    ? fontColorContrast(`#${eventData.background_color}`)
                    : 'white',
                }}
                disabled={isClaimableLoading}
                onClick={() => setCheckoutOpen(true)}
              >
                Register
              </Button>
            </div>
          )}
        </section>
      </div>

      <section className="flex flex-col mb-8">
        {!hasValidKey && isClaimable && isCheckoutOpen && (
          <WalletlessRegistration lockAddress={lockAddress} network={network} />
        )}
        {hasValidKey && (
          <p className="text-lg">
            🎉 You already have a ticket! You can view it in{' '}
            <Link className="underline" href="/keychain">
              your keychain
            </Link>
            .
          </p>
        )}
        {isLockManager && (
          <div className="grid gap-6 mt-12">
            <span className="text-2xl font-bold text-brand-dark">
              Tools for you, the lock manager
            </span>
            <div className="grid gap-4">
              <div className="grid w-full grid-cols-1 p-6 bg-white border border-gray-200 md:items-center md:grid-cols-3 rounded-2xl">
                <div className="flex flex-col md:col-span-2">
                  <span className="text-lg font-bold text-brand-ui-primary">
                    Event detail
                  </span>
                  <span>
                    Need to change something? Access your contract (Lock) &
                    update detail
                  </span>
                </div>
                <div className="md:col-span-1">
                  <Button
                    onClick={onEdit}
                    variant="black"
                    className="w-full border"
                    size="small"
                  >
                    Edit Details
                  </Button>
                </div>
              </div>
              <div className="w-full p-6 bg-white border border-gray-200 rounded-2xl">
                <div className="flex flex-col mb-2">
                  <span className="text-lg font-bold text-brand-ui-primary">
                    Verifiers
                  </span>
                  <span>
                    Add & manage trusted users at the event to help check-in
                    attendees
                  </span>
                </div>
                <VerifierForm
                  lockAddress={lockAddress}
                  network={network}
                  isManager={isLockManager}
                  disabled={!isLockManager}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EventDetails
