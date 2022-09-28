import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Please confirm your email address'),
  text: handlebars.compile(
    `Welcome to Unlock!

To get started, please confirm your email address by clicking on the following link:

  {{confirmLink}}?email={{email}}&signedEmail={{signedEmail}}

Once your email address is confirmed, you'll be able to use your Unlock account to pay for content and services.

If you have any questions, you can always email us at hello@unlock-protocol.com.

And again, welcome!

The Unlock team
`
  ),
}
