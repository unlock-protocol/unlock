import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'
import { transactionLink } from './helpers/transactionLink'
import { eventDetails } from './helpers/eventDetails'

handlebars.registerHelper('links', links)
handlebars.registerHelper('transactionLink', transactionLink)
handlebars.registerHelper('eventDetails', eventDetails)

export default {
  base: 'events',
  subject: `Here is your ticket for {{{lockName}}}`,
  html: `<h1>Here's your ticket</h1>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

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
