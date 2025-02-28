import { FiArrowRight as ArrowRightIcon } from 'react-icons/fi'
import { IoMdTime as TimeIcon } from 'react-icons/io'
import { TbUsers as AttendeesIcon } from 'react-icons/tb'
import { BsTicket as TicketIcon } from 'react-icons/bs'
import Link from 'next/link'
import { Card, Detail, Icon } from '@unlock-protocol/ui'
import dayjs from 'dayjs'
import { useEventAttendees } from '~/hooks/useEventAttendees'
import { useEventRSVP } from '~/hooks/useRsvp'

interface EventCardProps {
  event: {
    name: string
    checkoutConfig: any
    slug: string
    ticket: {
      event_start_date: string
      event_end_date: string
    }
    image: string
  }
}

interface EventImageProps {
  imageUrl: string
}

const EventImage = ({ imageUrl }: EventImageProps) => {
  return (
    <div className="relative block overflow-hidden rounded-2xl h-20 w-20 group">
      <img alt="logo" className="object-cover h-full aspect-1" src={imageUrl} />
    </div>
  )
}

export const EventCard = ({ event }: EventCardProps) => {
  const { name, checkoutConfig, slug, ticket, image: imageUrl } = event
  const eventDate = dayjs(ticket.event_start_date).format('D MMM YYYY')
  const eventEndDate = dayjs(ticket.event_end_date).format('D MMM YYYY')

  const { data: eventAttendees, isPending: isEventAttendeesLoading } =
    useEventAttendees({
      checkoutConfig,
    })

  const { data: eventRSVP, isPending: isEventRSVPLoading } = useEventRSVP({
    checkoutConfig,
    eventEndDate,
  })

  return (
    <Card variant="simple" shadow="lg" padding="md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-1/3">
          <EventImage imageUrl={imageUrl} />
          <div className="flex flex-col gap-2 flex-grow">
            <div className="flex gap-2">
              <span className="text-xl md:text-2xl font-bold overflow-hidden overflow-ellipsis line-clamp-3">
                {name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center w-full md:w-1/2 my-4 md:my-0">
          <div className="grid text-center grid-cols-3 gap-4 w-full max-w-md">
            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={TimeIcon} />
                  <span>Event Date</span>
                </div>
              }
              labelSize="tiny"
              valueSize="small"
              truncate
            >
              {eventDate}
            </Detail>
            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={TicketIcon} />
                  <span>
                    {eventRSVP?.isExpired ? 'Total RSVPs' : 'Active RSVPs'}
                  </span>
                </div>
              }
              loading={isEventRSVPLoading}
              labelSize="tiny"
              valueSize="small"
              truncate
            >
              {eventRSVP?.rsvpCount}
            </Detail>
            <Detail
              label={
                <div className="flex items-center gap-1">
                  <Icon size={10} icon={AttendeesIcon} />
                  <span>Attendees</span>
                </div>
              }
              loading={isEventAttendeesLoading}
              labelSize="tiny"
              valueSize="small"
              truncate
            >
              {eventAttendees?.length}
            </Detail>
          </div>
        </div>
        <div className="flex items-center w-full md:w-1/6 justify-end">
          <Link href={`/event/${slug}`} aria-label="arrow right">
            <button className="flex items-center justify-between w-full md:w-auto">
              <span className="text-base font-bold md:hidden mr-2">Manage</span>
              <ArrowRightIcon size={20} />
            </button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
