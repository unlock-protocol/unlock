import handlebars from 'handlebars'
import { eventDetailStyle } from './customContentStyle'
import { google } from 'calendar-link'
import dayjs from 'dayjs'

export function eventDetails(
  eventName: string,
  eventDescription: string,
  eventDate: string,
  eventTime: string,
  eventAddress: string
) {
  let eventDetails = ''
  if (
    [eventName, eventDescription, eventDate, eventTime, eventAddress].join('')
      .length > 0
  ) {
    const date = dayjs(eventDate)
    const calendarEvent = {
      title: eventName,
      start: date.toDate(),
      description: eventDescription || '',
      // https://github.com/AnandChowdhary/calendar-link#options
      allDay: false,
      end: new Date(date.toDate().getTime() + 1000 * 60 * 60),
      url: '',
    }

    eventDetails = `<h2>Event details</h2>`

    if (!!eventDescription) {
      eventDetails = `${eventDetails}
        <p>${eventDescription}</p>
      `
    }

    if (!!eventDate) {
      eventDetails = `${eventDetails}
        <div>
          <strong>Date:</strong> ${eventDate}
        </div>
      `
    }

    if (!!eventTime) {
      eventDetails = `${eventDetails}
        <div>
          <strong>Time:</strong> ${eventTime}
        </div>
      `
    }

    if (!!eventAddress) {
      eventDetails = `${eventDetails}
        <div>
          <strong>Location:</strong>
          <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${eventAddress}"> 
            ${eventAddress}
          </a>
        </div>
      `
    }

    // Wrap content with container with style
    eventDetails = `
        <div style="${eventDetailStyle}">
          ${eventDetails}
          ${
            !!eventName && !!eventDate && !!eventDescription
              ? `<br />
          <a target="_blank" href="${google(calendarEvent)}"> 
            Add to Google Calendar
          </a>`
              : ''
          }
        </div>
      `
  }

  return new handlebars.SafeString(eventDetails)
}
