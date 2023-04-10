import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: `Your certification for {{{lockName}}}`,
  html: `<h1>A NFT certification for "{{lockName}}" was airdropped to you!</h1>
<p><a href="{{certificationUrl}}">Here</a> is your NFT certification (#{{keyId}}) for <strong>{{lockName}}</strong>. It was also just airdropped to your address.</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

{{#if isUserAddress}}
  <p>It has also been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>
{{else}}
  <p>You can transfer it to your own wallet by going to <a href="{{transferUrl}}">here</a>.</p>
{{/if}}
{{links txUrl openSeaUrl true}}
`,
}
