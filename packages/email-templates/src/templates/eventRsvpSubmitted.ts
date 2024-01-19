import Handlebars from 'handlebars'
import { links } from './helpers/links'
import { transactionLink } from './helpers/transactionLink'
import { eventDetailsLight } from './helpers/eventDetails'

Handlebars.registerHelper('links', links)
Handlebars.registerHelper('transactionLink', transactionLink)
Handlebars.registerHelper('eventDetailsLight', eventDetailsLight)

export default {
  base: 'events',
  subject: `You have applied to attend {{{eventName}}}!`,
  html: `<h1>Thanks</h1>

You have successfully applied to attend <strong>{{{eventName}}}</strong>.
The organizer will be in touch with you soon, and, if you are accepted, 
you will receive a confirmation email with your ticket!

{{eventDetailsLight 
  eventName
  eventDate
  eventTime
  eventUrl
}}
`,
}
