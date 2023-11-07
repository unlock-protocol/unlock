import handlebars from 'handlebars'
import { eventDetailStyle } from './customContentStyle'

export function eventDetails(
  lockName: string,
  keyId: string,
  eventDate: string,
  eventTime: string,
  eventAddress: string,
  eventUrl: string
) {
  let content = `
  <div style="${eventDetailStyle}">
  <h2>Event details</h2>

    <div>
      <strong>${lockName}</strong>
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

    <div>
      <a style="display:inline-block;background-color:#603DEE;color:white !important;font-family:helvetica;font-size:16px;line-height:1;margin:0;text-decoration:none;text-transform:none;border-radius:9999px;font-weight:700;padding:12px 24px;margin-top:12px" target="_blank" href="${eventUrl}">View Event Page</a>
    </div>
  </div>`

  return new handlebars.SafeString(content)
}
