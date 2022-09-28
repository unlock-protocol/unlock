import handlebars from 'handlebars'

export default {
  subject: handlebars.compile(`Your proof of key ownership for "{{lockName}}"`),
  text: handlebars.compile(
    `Hello,

The QR code attached to this email proves that you own a key for {{lockName}}.

If you're asked to demonstrate that you own this key, simply show the QR code attached to this email. The signature contained in this QR code has a timestamp, so if it's been a very long time you may want to generate a fresher code at {{keychainLink}}.

Thanks!

The Unlock Team
`
  ),
}
