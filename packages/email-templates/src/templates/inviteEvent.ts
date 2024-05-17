import Handlebars from 'handlebars'

import { formattedCustomContent } from './helpers/customContent'

Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  subject: 'You are invited to RSVP for {{eventName}}',
  html: `<h1>You are invited to {{eventName}}!</h1>

<p>The organizer of {{eventName}} is inviting you to RSVP for their event.</p>

{{eventDetailsLight 
  eventName
  eventDate
  eventTime
  eventUrl
}}


`,
}
