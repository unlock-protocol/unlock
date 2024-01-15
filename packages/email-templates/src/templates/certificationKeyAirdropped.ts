import Handlebars from 'handlebars'
import { links } from './helpers/links'
import { certificationLink } from './helpers/certificationLink'
import { formattedCustomContent } from './helpers/customContent'

Handlebars.registerHelper('links', links)
Handlebars.registerHelper('certificationLink', certificationLink)
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  subject: `Your certification for {{{lockName}}}`,
  html: `<h1>Your NFT certification for "{{lockName}}" was airdropped!</h1>
{{certificationLink lockName certificationUrl}}

{{formattedCustomContent "Certification Authority" customContent}}

{{#if isUserAddress}}
  <p>It has also been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>
{{else}}
  <p>You can transfer it to your own wallet <a href="{{transferUrl}}">by going there</a>.</p>
{{/if}}
`,
}
