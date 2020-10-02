const ethWaterlooMessage = `

After you check in to ETHWaterloo we'll refund your stake in DAI. If you are an Unlock account user, you'll be able to access those funds once you eject your Unlock account into a crypto wallet. We'll provide more details on that process soon! Note that this event ticket is non-transferable.`

export default {
  subject: (params) => `You've got your ticket for ${params.eventName}!`,
  text: (params) =>
    `Hello,

This is just a reminder that you are attending the event ${
      params.eventName
    } on ${params.eventDate}!${
      params.eventName.toLowerCase() === 'ethwaterloo' ? ethWaterlooMessage : ''
    }

When you're asked for your ticket at the door, simply show the QR code attached to this email. Alternately, you can click the following link and open it using your crypto-enabled web browser or Unlock user account.

${params.ticketLink}

Enjoy!

The Unlock team
`,
}
