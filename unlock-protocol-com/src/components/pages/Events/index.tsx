import { Button } from '@unlock-protocol/ui'
import {
  FiCalendar as CalendarIcon,
  FiMapPin as MapPinIcon,
} from 'react-icons/fi'

export function Events() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-0">
      <header className="flex flex-col gap-[16px] pt-[24px]">
        <h1 className="heading">Upcoming Events</h1>
        <p className="text-lg">
          Join us for AMA, Governance and other activities
        </p>
      </header>

      <section className="grid grid-cols-1 gap-[32px] py-[40px] lg:grid-cols-3">
        <div className="flex flex-col justify-between h-full gap-4 p-8 glass-pane rounded-xl">
          <div className="flex gap-[8px] items-center">
            <CalendarIcon className="stroke-brand-ui-primary" />
            <span className="text-brand-ui-primary text-sm font-semibold uppercase">
              Wednesday, April 13⋅1:00 – 2:00pm
            </span>
          </div>
          <h3 className="text-xl font-semibold sm:text-3xl">
            Summary, event title here
          </h3>
          <span className="text-brand-gray">
            Description show here:Join the Unlock team for deep AMA
            conversations about the most exciting and pressing aspects of web3,
            DAOs and all things surrounding NFT memberships! Please hop over to
            our profile to join the conversation!
            https://twitter.com/UnlockProtocol
          </span>
          <div className="flex gap-[8px] items-center">
            <MapPinIcon />
            <span className="text-brand-ui-primary text-lg font-bold">
              https://google.it
            </span>
          </div>
          <Button variant="secondary">Add to Calendar</Button>
        </div>
      </section>
    </div>
  )
}
