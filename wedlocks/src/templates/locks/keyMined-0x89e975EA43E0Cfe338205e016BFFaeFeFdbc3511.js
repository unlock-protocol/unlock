export default {
  subject: () => 'BCN Auction',
  html: () =>
    `
<img src="cid:blackpool-nfa-barcelona.jpg"/>
<p>Congratulations! You’ve successfully reserved your ticket for the Auction! You’ll receive a link to generate your QR code ticket a couple of days before the event. Once your ticket is scanned at the door of the venue, you’ll automatically be included in the raffle for a physical airdrop on site.</p>

<p>
<strong>Tips</strong> : <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20220328T160000Z%2F20220328T200000Z&location=Valkiria HUB%2C Carrer de Pujades%2C 126%2C 08005 Barcelona%2C Spain&text=Non Fungible Auction">Add it to your Calendar</a></p>

<p>The apes are excited to welcome you to the BP universe, fren!</p>

<p>
👀 : <a href="https://blackpool.finance/events">https://blackpool.finance/events</a>
</p>

<p>
-- BlackPool
</p>
    `,
  attachments: [
    {
      filename: 'blackpool-nfa-barcelona.jpg',
      path: 'https://wedlocks.unlock-protocol.com/attachments/blackpool-nfa-barcelona.jpg',
      cid: 'blackpool-nfa-barcelona.jpg',
    },
  ],
}
