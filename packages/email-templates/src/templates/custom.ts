import Handlebars from 'handlebars'

import { formattedCustomContent } from './helpers/customContent'
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  subject: `{{subject}}`,
  html: `
  {{formattedCustomContent "Contract Manager" content}}
  <p>If you do not want to receive emails for this person, you can <a href="{{unsubscribeLink}}">unsubscribe</a>.</p>
  `,
}
