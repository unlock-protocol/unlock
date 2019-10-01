export default {
  subject: params => `You are attending ${params.eventName}!`,
  text: params =>
    `Hello,

This is just a reminder that you are attending the event ${params.eventName} on ${params.eventDate}!

When you're asked for your ticket at the door, just click on the following link and open it using your crypto enabled web browser:

${params.ticketLink}.

You can also show the QR code attached to this email.

Enjoy!

The Unlock team
`,
}
