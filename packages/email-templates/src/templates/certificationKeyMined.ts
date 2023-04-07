import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: `Your certification for {{{lockName}}}`,
  html: `<h1>A NFT certification for "{{lockName}}" was added to your wallet!</h1>
<p>Your NFT certification (#{{keyId}}) for <strong>{{lockName}}</strong> was just mined. You can <a href="{{certificationUrl}}">consult it directly</a> on this web page.</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>

{{links txUrl openSeaUrl true}}
`,
}
