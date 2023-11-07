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

<small>Have a crypto wallet? Your ticket is an NFT and can be transferred to your self-custodial wallet <a href="{{transferUrl}}">by going there</a>.</small>
`,
}
