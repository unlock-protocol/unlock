import fontColorContrast from 'font-color-contrast'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { GoLocation } from 'react-icons/go'
import { FaCalendar, FaClock } from 'react-icons/fa'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'

import { useAuth } from '~/contexts/AuthenticationContext'
import { useMetadata } from '~/hooks/metadata'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { selectProvider } from '~/hooks/useAuthenticate'
import LoadingIcon from '~/components/interface/Loading'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import { Button, Modal, Tooltip } from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { AddressLink } from '~/components/interface/AddressLink'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'
import { getEventDate, getEventEndDate } from './utils'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'
import { useStorageService } from '~/utils/withStorageService'
import dayjs from 'dayjs'
import { WalletlessRegistration } from './WalletlessRegistration'

interface EventDetailsProps {
  lockAddress: string
  network: number
}

export const EventDetails = ({ lockAddress, network }: EventDetailsProps) => {
  const { account } = useAuth()
  const web3Service = useWeb3Service()
  const storageService = useStorageService()

  const config = useConfig()

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })

  const { isLoading: isClaimableLoading, data: isClaimable } = useQuery(
    ['claim', lockAddress, network],
    () => {
      return storageService.canClaimMembership({
        network,
        lockAddress,
      })
    }
  )

  const { data: hasValidKey, isInitialLoading: isHasValidKeyLoading } =
    useQuery(
      ['hasValidKey', network, lockAddress, account],
      async () => {
        return web3Service.getHasValidKey(lockAddress, account!, network)
      },
      {
        enabled: !!account,
      }
    )

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  if (isMetadataLoading || isHasValidKeyLoading) {
    return <LoadingIcon></LoadingIcon>
  }

  const onEdit = () => {
    return router.push(
      `/locks/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  if (!metadata?.attributes) {
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

  const eventData = toFormData(metadata)
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

  const onRegister = () => {
    setCheckoutOpen(true)
    // Check if the lock is free and on a free network and
    // if so let's add support for walletless airdrop from the backend!
    if (isClaimable) {
      console.log('Cool')
      // Show screen for claims!
      // Can we get the metadata from the checkout
      // Add a wallet field too!
    } else {
      // Use regular checkout!
    }
  }

  return (
    <main className="grid md:grid-cols-[minmax(0,_1fr)_300px] mt-8">
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

      <section className="">
        <h1 className="mb-4 text-5xl font-bold md:text-7xl">
          {eventData.name}
        </h1>
        <div className="flex gap-2 mb-4 flex-rows">
          <span className="text-brand-gray">Ticket contract</span>
          <AddressLink
            lockAddress={lockAddress}
            network={network}
          ></AddressLink>
        </div>
        <ul
          className="mb-6 text-xl bold md:text-2xl"
          style={{ color: `#${eventData.background_color}` }}
        >
          {eventDate && (
            <li className="flex items-center mb-2 ">
              <FaCalendar className="inline mr-2" />
              <div className="flex flex-col gap-1 text-lg md:flex-row md:items-center md:text-2xl">
                <span>
                  {eventDate.toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {eventEndDate && !isSameDay && (
                  <>
                    <span className="hidden md:block">to</span>
                    <span>
                      {eventEndDate.toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </>
                )}
              </div>
            </li>
          )}
          {eventDate && eventData.ticket?.event_start_time && (
            <li className="flex items-center mb-2">
              <FaClock className="inline mr-2" />
              <Tooltip
                delay={0}
                label={eventData.ticket.event_timezone}
                tip={eventData.ticket.event_timezone}
                side="bottom"
              >
                <div className="flex items-center gap-1 text-lg md:text-2xl">
                  <span>
                    {eventDate.toLocaleTimeString(
                      navigator.language || 'en-US',
                      {
                        timeZone: eventData.ticket.event_timezone,
                      }
                    )}
                  </span>
                  {eventEndDate && isSameDay && (
                    <>
                      <span>to</span>
                      <span>
                        {eventEndDate.toLocaleTimeString(
                          navigator.language || 'en-US',
                          {
                            timeZone: eventData.ticket.event_timezone,
                          }
                        )}
                      </span>
                    </>
                  )}
                </div>
              </Tooltip>
            </li>
          )}
          {(eventData?.ticket?.event_address || '')?.length > 0 && (
            <li className="mb-2">
              <Link
                target="_blank"
                href={`https://www.google.com/maps/search/?api=1&query=${eventData.ticket?.event_address}`}
              >
                <GoLocation className="inline mr-2" />
                {eventData.ticket?.event_address}
              </Link>
            </li>
          )}
        </ul>
        {eventData.description && (
          <div className="markdown">
            {/* eslint-disable-next-line react/no-children-prop */}
            <ReactMarkdown children={eventData.description} />
          </div>
        )}
      </section>

      <section className="flex flex-col items-center">
        <img
          alt={eventData.title}
          className="mb-5 aspect-auto "
          src={eventData.image}
        />
        <ul className="flex justify-around w-1/2">
          <li className="bg-gray-200 rounded-full">
            <AddToCalendarButton event={eventData} />
          </li>
          <li className="bg-gray-200 rounded-full">
            <TweetItButton event={eventData} />
          </li>
        </ul>
      </section>
      <section className="flex flex-col mb-8">
        {!hasValidKey && !isCheckoutOpen && (
          <Button
            variant="primary"
            size="medium"
            className="md:w-1/2"
            style={{
              backgroundColor: `#${eventData.background_color}`,
              color: `#${eventData.background_color}`
                ? fontColorContrast(`#${eventData.background_color}`)
                : 'white',
            }}
            disabled={isClaimableLoading}
            onClick={onRegister}
          >
            Register
          </Button>
        )}
        {!hasValidKey && isClaimable && isCheckoutOpen && (
          <WalletlessRegistration />
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
    </main>
  )
}

export default EventDetails
