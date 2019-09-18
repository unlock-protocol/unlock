import React from 'react'
import UnlockPropTypes from '../../propTypes'
import { Links, Link } from './EventStyles'
import { googleCalendarLinkBuilder } from '../../utils/links'

export const EventLinks = ({ event }) => {
  if (typeof window === 'undefined') {
    return <></>
  }
  const { name, description, links = [], date, duration, location } = event

  // Start building the info for the GCal link
  let details = description

  // Clean up user-provided links
  const sanitizedLinks = links.map(link => {
    link.href = encodeURI(link.href)
    return link
  })

  if (sanitizedLinks.length) {
    details += '\n\n<strong>Event Website</strong>'
    sanitizedLinks.forEach(link => {
      details += '\n' + link.href
    })
  }
  details += `\n\n<strong>Ticket Details</strong>\n${window.location.href}`

  // No need to sanitize the GCal link because googleCalendarLinkBuilder does it for us
  let googleCalendarLink = googleCalendarLinkBuilder(
    name,
    details,
    date,
    duration,
    location
  )

  const eventLinks = [
    ...sanitizedLinks,
    {
      href: googleCalendarLink,
      text: 'Add to your Calendar!',
      icon: '/static/images/illustrations/calendar.svg',
    },
  ]

  const externalLinks = eventLinks.map(
    ({ href, text, icon = '/static/images/illustrations/link.svg' }) => {
      return (
        <Link key={href} icon={icon}>
          <a target="_blank" rel="noopener noreferrer" href={href}>
            {text}
          </a>
        </Link>
      )
    }
  )

  return <Links>{externalLinks}</Links>
}
EventLinks.propTypes = {
  event: UnlockPropTypes.ticketedEvent,
}
EventLinks.defaultProps = {
  event: {},
}

export default EventLinks
