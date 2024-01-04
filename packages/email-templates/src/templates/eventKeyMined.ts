import Handlebars from 'handlebars'
import { links } from './helpers/links'
import { transactionLink } from './helpers/transactionLink'
import { eventDetails } from './helpers/eventDetails'
import { formattedCustomContent } from './helpers/customContent'

Handlebars.registerHelper('links', links)
Handlebars.registerHelper('transactionLink', transactionLink)
Handlebars.registerHelper('eventDetails', eventDetails)
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  base: 'events',
  subject: `Here is your ticket for {{{lockName}}}`,
  html: `<h1>Here's your ticket</h1>

{{formattedCustomContent "Event Organizer" customContent}}

{{eventDetails 
  eventName
  keyId
  eventDate
  eventTime
  eventAddress
  eventUrl
}}

{{transactionLink transactionReceiptUrl}}
`,
}
