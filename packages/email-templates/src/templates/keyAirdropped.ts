import handlebars from 'handlebars'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: 'A new Membership NFT was airdropped to you',
  html: `<h1>A new Membership NFT was airdropped to you</h1>

<p>A new membership (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just airdropped for you!</p>

{{#if customContent}}
  <section style="margin: 18px 0px; padding: 18px 18px 10px 18px; background: #F8FAFC; font-family: monospace, sans-serif;" class="custom">
    {{{customContent}}}
  </section>
{{/if}}

<p> You can transfer it to your own wallet by going to <a href="{{transferUrl}}">here</a>. You can also print Membership NFT as a signed QR code attached to this email. </p>

{{links txUrl openSeaUrl true}}

`,
}
