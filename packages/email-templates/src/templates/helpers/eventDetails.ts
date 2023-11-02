import handlebars from 'handlebars'
import { eventDetailStyle } from './customContentStyle'

export function eventDetails(
  lockName: string,
  keyId: string,
  eventDate: string,
  eventTime: string,
  eventAddress: string,
  eventDescription: string
) {
  let content = `
  <div style="${eventDetailStyle}">
  <h2>Event details</h2>

    <div>
      <strong>Ticket:</strong> ${lockName}
    </div>

    <div>
      <strong>Ticket:</strong> #${keyId}
    </div>

    <div>
      <strong>Date:</strong> ${eventDate}
    </div>

    <div>
      <strong>Time:</strong> ${eventTime}
    </div>

    <div>
      <strong>Location:</strong>
      <a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${eventAddress}"> 
        ${eventAddress}
      </a>
    </div>
    <br />
    <div>
    ${eventDescription}
    </div>
</div>`

  return new handlebars.SafeString(content)
}
