import Handlebars from 'handlebars'
import { links } from './helpers/links'
import { certificationLink } from './helpers/certificationLink'
import { formattedCustomContent } from './helpers/customContent'
import { prepareAll } from './prepare'

Handlebars.registerHelper('links', links)
Handlebars.registerHelper('certificationLink', certificationLink)
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default prepareAll({
  subject: `Your certification for {{{lockName}}}`,
  html: `<h1>A NFT certification for "{{lockName}}" was sent to you!</h1>
{{certificationLink lockName certificationUrl}}

{{formattedCustomContent "Certification Authority" customContent}}

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and its metadata.</p>

`,
})
