export default {
  subject: (params) => `Your proof of key ownership for "${params.lockName}"`,
  text: (params) =>
    `Hello,

The QR code attached to this email proves that you own a key for ${params.lockName}.

If you're asked to demonstrate that you own this key, simply show the QR code attached to this email. The signature contained in this QR code has a timestamp, so if it's been a very long time you may want to generate a fresher code at ${params.keychainLink}.

Thanks!

The Unlock Team
`,
}
