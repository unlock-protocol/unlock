import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'
import { transactionLink } from './helpers/transactionLink'

handlebars.registerHelper('links', links)
handlebars.registerHelper('transactionLink', transactionLink)

export default {
  subject: 'You have received a new NFT!',
  html: `<h1>You have received a new NFT!</h1>

<p>A new membership (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just minted for you!</p>

{{#if customContent}}
<section style="${customContentStyle}">
{{{customContent}}}
  </section>
{{/if}}

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>

{{links txUrl openSeaUrl true}}

{{transactionLink transactionReceiptUrl}}
`,
}
