import handlebars from 'handlebars'

export default {
  subject: handlebars.compile('Please withdraw your funds'),
  text: handlebars.compile(
    `Hi there!

We've noticed that you're carrying a total balance of {{balance}} ETH on your locks at Unlock. You should consider withdrawing your funds to a safe wallet on another service.

Because Unlock isn't designed to store large amounts of funds for a long time, if you haven't withdrawn your balance by {{dueDate}}, we will disconnect your account from the Unlock service.

Your funds are yours and you will be able to transfer them via a third-party tool. However, you won't be able to access them from the Unlock service.

If you have any questions, you can always email us at hello@unlock-protocol.com.

The Unlock team
`
  ),
}
