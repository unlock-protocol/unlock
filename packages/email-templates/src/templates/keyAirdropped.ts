import handlebars from 'handlebars'
import { customContentStyle } from './helpers/customContentStyle'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: 'You have received a new NFT!',
  html: `<h1>You have received a new NFT!</h1>

<p>A new membership (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just airdropped for you!</p>

{{#if customContent}}
  <section style="${customContentStyle}">
    {{{customContent}}}
  </section>
{{/if}}

<p> You can transfer it to your own wallet <a href="{{transferUrl}}">by going there</a>. You can also print Membership NFT as a signed QR code attached to this email. </p>

{{links txUrl openSeaUrl true}}

`,
}
