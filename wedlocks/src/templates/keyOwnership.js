import handlebars from 'handlebars'

export default {
  subject: handlebars.compile(`Your proof of key ownership for "{{lockName}}"`),
  html: handlebars.compile(
    `<h1>QR Code</h1>

    <p>The QR code attached to this email proves that you own a key for <strong>{{lockName}}</strong>.</p>

    <p>If you're asked to prove that you own this NFT, simply show the QR code attached to this email. The signature contained in this QR code has a timestamp, so if it's been a very long time you may want to generate a fresher code <a href="{{keychainLink}}">on your keychain</a>.</p>
`
  ),
}
