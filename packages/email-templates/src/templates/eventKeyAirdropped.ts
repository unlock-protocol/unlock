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
  subject: `Here is your ticket!`, // using {{{}}} prevents HTML escaping
  html: `<h1>Here is your ticket</h1>

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

<p>You can view your ticket online <a href="{{keychainUrl}}">here</a>.</p>

<p>You can transfer it to your own wallet <a href="{{transferUrl}}">by going there</a>. You can also print the ticket attached to this email.</p>

{{links txUrl openSeaUrl true}}

{{transactionLink transactionReceiptUrl}}

`,
}
