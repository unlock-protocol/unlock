import handlebars from 'handlebars'

export function eventDetails(
  eventDescription?: string,
  eventDate?: string,
  eventTime?: string,
  eventAddress?: string
) {
  let eventDetails = ''
  if (
    [eventDescription, eventDate, eventTime, eventAddress].join('').length > 0
  ) {
    eventDetails = `<h2>Event details</h2>`

    if (!!eventDescription) {
      eventDetails = `${eventDetails}
        <p>${eventDescription}</p>
      `
    }

    if (!!eventDate) {
      eventDetails = `${eventDetails}
        <div><strong>Date:</strong> ${eventDate}</div>
      `
    }

    if (!!eventTime) {
      eventDetails = `${eventDetails}
      <div><strong>Time:</strong> ${eventTime}</div>
      `
    }

    if (!!eventAddress) {
      eventDetails = `${eventDetails}
      <div><strong>Location:</strong> ${eventAddress}</div>
      `
    }
  }

  return new handlebars.SafeString(eventDetails)
}
