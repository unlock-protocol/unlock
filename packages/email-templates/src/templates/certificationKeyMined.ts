import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'
import { certificationLink } from './helpers/certificationLink'

handlebars.registerHelper('links', links)
handlebars.registerHelper('certificationLink', certificationLink)

export default {
  subject: `Your certification for {{{lockName}}}`,
  html: `<h1>A NFT certification for "{{lockName}}" was sent to you!</h1>
{{certificationLink lockName certificationUrl}}

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and its metadata.</p>

{{links txUrl openSeaUrl true}}
`,
}
