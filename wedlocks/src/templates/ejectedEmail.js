import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Your account has been disconnected'),
  text: handlebars.compile(
    `Hi there!

Because your account has continued to carry a total balance of {{balance}} ETH on your locks at Unlock, we have disconnected it from our service. This is for your safety, because Unlock isn't designed to store large amounts of funds for a long time.

Your funds are yours and you can still transfer them via a third-party tool. However, you won't be able to access them from the Unlock service.

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
  ),
}
