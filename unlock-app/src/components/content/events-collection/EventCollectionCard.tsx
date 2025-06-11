import { FiArrowRight as ArrowRightIcon } from 'react-icons/fi'
import { Card } from '@unlock-protocol/ui'
import Link from 'next/link'

export interface EventCollectionCardProps {
  eventCollection: {
    slug: string
    coverImage: string
    title: string
  }
}

export const EventCollectionCard = ({
  eventCollection,
}: EventCollectionCardProps) => {
  return (
    <Card variant="simple" shadow="lg" padding="md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full ">
          <div className="relative block overflow-hidden rounded-2xl h-20 w-20 group">
            <img
              alt="logo"
              className="object-cover h-full aspect-1"
              src={eventCollection.coverImage}
            />
          </div>

          <div className="flex flex-col gap-2 flex-grow ">
            <span className=" text-xl md:text-2xl font-bold overflow-hidden overflow-ellipsis line-clamp-3">
              {eventCollection.title}
            </span>
          </div>
        </div>

        <div className="flex items-center w-full md:w-1/6 justify-end">
          <Link
            href={`/event/${eventCollection.slug}`}
            aria-label="arrow right"
          >
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
