import fontColorContrast from 'font-color-contrast'
import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useMetadata, useUpdateMetadata } from '~/hooks/metadata'
import { useConfig } from '~/utils/withConfig'
import { selectProvider } from '~/hooks/useAuthenticate'
import {
  MetadataFormData,
  formDataToMetadata,
  toFormData,
} from '~/components/interface/locks/metadata/utils'
import {
  Button,
  Card,
  Disclosure,
  Drawer,
  Icon,
  ImageUpload,
  Modal,
  Placeholder,
} from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { AddressLink } from '~/components/interface/AddressLink'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'
import { getEventDate, getEventEndDate } from './utils'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'
import dayjs from 'dayjs'
import { WalletlessRegistrationForm } from './WalletlessRegistration'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { FiMapPin as MapPinIcon } from 'react-icons/fi'
import { IconType } from 'react-icons'
import { useValidKey } from '~/hooks/useKey'
import { getLockTypeByMetadata } from '@unlock-protocol/core'
import { HiOutlineTicket as TicketIcon } from 'react-icons/hi'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useLockData } from '~/hooks/useLockData'
import { useGetLockCurrencySymbol } from '~/hooks/useSymbol'
import { useImageUpload } from '~/hooks/useImageUpload'
import { useCanClaim } from '~/hooks/useCanClaim'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'

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
    <div className="grid grid-cols-[64px_1fr] gap-4">
      <div className="flex w-16 h-16 bg-white border border-gray-200 min-w-16 rounded-2xl">
        <Icon className="m-auto" icon={icon} size={32} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xl font-bold text-black">{label}</span>
        <div>{children}</div>
      </div>
    </div>
  )
}

interface CoverImageDrawerProps {
  image: string
  setImage: (image: string) => void
  lockAddress: string
  network: number
  metadata: MetadataFormData
  handleClose: () => void
}
const CoverImageDrawer = ({
  image,
  setImage,
  lockAddress,
  network,
  metadata,
  handleClose,
}: CoverImageDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const { mutateAsync: updateMetadata, isLoading } = useUpdateMetadata({
    lockAddress,
    network,
  })

  const coverImage = metadata.ticket?.event_cover_image

  const onSubmit = async () => {
    const metadataObj = formDataToMetadata({
      ...metadata,
      ticket: {
        ...metadata?.ticket,
        event_cover_image: image,
      },
    })
    await updateMetadata(metadataObj)
    setIsOpen(false)
    handleClose()
  }

  return (
    <div className="relative inset-0 z-[1]">
      {isLockManager && (
        <Button
          className="absolute bottom-3 right-3 md:bottom-8 nd:right-9"
          variant="secondary"
          size="tiny"
          onClick={() => {
            setIsOpen(true)
            setImage(coverImage || '')
          }}
        >
          {coverImage ? 'Change image' : 'Upload Image'}
        </Button>
      )}
      <div className="relative">
        <Drawer isOpen={isOpen} setIsOpen={setIsOpen} title="Cover image">
          <div className="z-10 mt-2 space-y-6">
            <ImageUpload
              size="full"
              description="This illustration will be used as cover image for your event page"
              preview={image}
              isUploading={isUploading}
              imageRatio="cover"
              onChange={async (fileOrFileUrl: any) => {
                if (typeof fileOrFileUrl === 'string') {
                  setImage(fileOrFileUrl)
                } else {
                  const items = await uploadImage(fileOrFileUrl[0])
                  const image = items?.[0]?.publicUrl
                  if (!image) {
                    return
                  }
                  setImage(image)
                }
              }}
            />
          </div>
          <Button
            className="w-full"
            size="small"
            type="submit"
            onClick={onSubmit}
            loading={isLoading}
            disabled={image === coverImage}
          >
            Save
          </Button>
        </Drawer>
      </div>
    </div>
  )
}

export const EventDetails = ({ lockAddress, network }: EventDetailsProps) => {
  const [image, setImage] = useState('')
  const config = useConfig()
  const { account } = useAuth()
  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })

  const { data: symbol } = useGetLockCurrencySymbol({
    lockAddress,
    network,
    contractAddress: lock?.currencyContractAddress,
  })

  const price =
    lock?.keyPrice && parseFloat(lock?.keyPrice) === 0 ? 'FREE' : lock?.keyPrice

  const keysLeft =
    Math.max(lock?.maxNumberOfKeys || 0, 0) - (lock?.outstandingKeys || 0)
  const isSoldOut = keysLeft === 0

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const {
    data: metadata,
    isInitialLoading: isMetadataLoading,
    refetch,
  } = useMetadata({
    lockAddress,
    network,
  })

  const { isLoading: isClaimableLoading, data: isClaimable } = useCanClaim({
    recipients: [account || ZERO],
    lockAddress,
    network,
    data: [],
  })

  const { data: hasValidKey, isInitialLoading: isHasValidKeyLoading } =
    useValidKey({
      lockAddress,
      network,
    })

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const { isEvent } = getLockTypeByMetadata(metadata)

  if (isMetadataLoading || isHasValidKeyLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Card size="lg" />
        <Placeholder.Root inline>
          <Placeholder.Image size="sm" />
          <Placeholder.Image size="sm" />
          <div className="w-1/3 ml-auto">
            <Placeholder.Card size="md" />
          </div>
        </Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Root>
    )
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
          hour: '2-digit',
          minute: '2-digit',
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
          hour: '2-digit',
          minute: '2-digit',
        })
      : null

  const hasLocation = (eventData?.ticket?.event_address || '')?.length > 0
  const hasDate = startDate || startTime || endDate || endTime

  const showWalletLess = !hasValidKey && isClaimable

  const coverImage = eventData.ticket?.event_cover_image

  const RegistrationCard = () => {
    if (isClaimableLoading || isLockLoading) {
      return <Placeholder.Card size="md" />
    }

    return (
      <Card className="grid gap-6 mt-10 lg:mt-0">
        <span className="text-2xl font-bold text-gray-900">Registration</span>
        {hasValidKey ? (
          <p className="text-lg">
            🎉 You already have a ticket! You can view it in{' '}
            <Link className="underline" href="/keychain">
              your keychain
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <>
                  {symbol && <CryptoIcon symbol={symbol} size={30} />}
                  <span>{price}</span>
                </>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon={TicketIcon} size={30} />
                <span className="text-base font-bold">
                  {isSoldOut ? 'Sold out' : keysLeft}
                </span>
                {!isSoldOut && <span className="text-gray-600">Left</span>}
              </div>
            </div>
            {showWalletLess ? (
              <WalletlessRegistrationForm
                lockAddress={lockAddress}
                network={network}
                disabled={isSoldOut}
              />
            ) : (
              <Button
                variant="primary"
                size="medium"
                style={{
                  backgroundColor: `#${eventData.background_color}`,
                  color: `#${eventData.background_color}`
                    ? fontColorContrast(`#${eventData.background_color}`)
                    : 'white',
                }}
                disabled={isClaimableLoading || isSoldOut}
                onClick={() => {
                  setCheckoutOpen(true)
                }}
              >
                Register
              </Button>
            )}
          </>
        )}
      </Card>
    )
  }

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
        <div className="relative">
          <div className="w-full h-32 overflow-hidden -z-0 bg-slate-200 md:h-80 md:rounded-3xl">
            {coverImage && (
              <img
                className="object-cover w-full h-full"
                src={coverImage}
                alt="Cover image"
              />
            )}
          </div>

          <CoverImageDrawer
            image={image}
            setImage={setImage}
            metadata={eventData}
            lockAddress={lockAddress}
            network={network}
            handleClose={() => {
              refetch()
            }}
          />

          <div className="absolute flex flex-col w-full gap-6 px-4 md:px-10 -bottom-12">
            <section className="flex justify-between">
              <div className="flex w-24 h-24 p-1 bg-white md:p-2 md:w-48 md:h-48 rounded-3xl">
                <img
                  alt={eventData.title}
                  className="object-cover w-full m-auto aspect-1 rounded-2xl"
                  src={eventData.image}
                />
              </div>
              <ul className="flex items-center gap-2 mt-auto md:gap-2">
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

        <section className="grid items-start grid-cols-1 gap-4 lg:grid-cols-3 mt-14 lg:px-12 lg:mt-28">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="text-4xl font-bold md:text-7xl">{eventData.name}</h1>
            <div className="flex gap-2 flex-rows">
              <span className="text-brand-gray">Ticket contract</span>
              <AddressLink lockAddress={lockAddress} network={network} />
            </div>
            <section className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:p-6 md:grid-cols-2 rounded-2xl">
                {hasDate && (
                  <EventDetail label="Date & Time" icon={CalendarIcon}>
                    <div
                      style={{ color: `#${eventData.background_color}` }}
                      className="flex flex-col text-lg font-normal capitalize text-brand-dark"
                    >
                      {(startDate || endDate) && (
                        <span>
                          {startDate} {endDate && <>to {endDate}</>}
                        </span>
                      )}
                      {startTime && endTime && (
                        <span>
                          {startTime} {endTime && <>to {endTime}</>}
                        </span>
                      )}
                    </div>
                  </EventDetail>
                )}
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
              <div className="mt-14">
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
          {!isCheckoutOpen && <RegistrationCard />}
        </section>
      </div>

      <section className="flex flex-col mb-8">
        {isLockManager && (
          <div className="grid gap-6 mt-12">
            <span className="text-2xl font-bold text-brand-dark">
              Tools for you, the lock manager
            </span>
            <div className="grid gap-4">
              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title="Event detail"
                    description="Need to change something? Access your contract (Lock) & update detail"
                  />
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
              </Card>

              <Disclosure
                label="Verifiers"
                description="Add & manage trusted users at the event to help check-in attendees"
              >
                <VerifierForm
                  lockAddress={lockAddress}
                  network={network}
                  isManager={isLockManager}
                  disabled={!isLockManager}
                />
              </Disclosure>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EventDetails
