import Handlebars from 'handlebars'
import { links } from './helpers/links'
import { formattedCustomContent } from './helpers/customContent'

Handlebars.registerHelper('links', links)
Handlebars.registerHelper('formattedCustomContent', formattedCustomContent)

export default {
  subject: 'You have received a new NFT!',
  html: `<h1>You have received a new NFT!</h1>

<p>A new membership (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just airdropped for you!</p>

{{formattedCustomContent "Membership Manager" customContent}}

<p> You can transfer it to your own wallet <a href="{{transferUrl}}">by going there</a>. You can also print Membership NFT as a signed QR code attached to this email. </p>

{{links txUrl openSeaUrl true}}

`,
}
