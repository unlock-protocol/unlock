import handlebars from 'handlebars'
import { eventDetailStyle } from './customContentStyle'

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
     </div>
   `
  }

  return new handlebars.SafeString(eventDetails)
}
