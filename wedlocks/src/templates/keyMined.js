import handlebars from 'handlebars'
import { links } from './helpers/links'

handlebars.registerHelper('links', links)

export default {
  subject: 'A membership was added to your wallet!',
  html: `<h1>A new Membership NFT in your wallet!</h1>

<p>A new membership (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just minted for you!</p>

{{customEmailContent}}

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>

{{links txUrl openSeaUrl true}}

`,
}
