import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Please confirm your account recovery'),
  text: handlebars.compile(
    `We received a request to recover your account using your recovery key.

If you did not make this request, please disregard this email. Otherwise, please click on the following link to confirm your account recovery request:

  {{recoveryKeyConfirmLink}}

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
  ),
}
