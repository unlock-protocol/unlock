export default {
  subject: () => 'Stable Show',
  html: () =>
    `
        <img src="cid:stable-show.jpeg"/>

        <p>
        Congrats, you’ve successfully reserved your ticket for the event! You’ll receive a link to generate a QR code ticket a couple of days before the event. Once your ticket is scanned at the door of the venue, you’ll automatically be entered into the raffle for a physical airdrop on-site.
        </p>

<aside>
📌 While the money-printing machine spins out of control and the FED continues to see Bitcoin as a way to sell guns and drugs, some tech geniuses are quietly building the future of the monetary system on the blockchain. 
Grab a seat and come participate in this discussion that will address the stablecoin issues that are too often adressed:
<ul>
<li> The underlying technologies / the collateral value type</li>
<li> The competition between protocols</li>
<li> The mid-term future against CBDCs</li>
</ul>
</aside>

<p>
<strong>Tips</strong> : Add a reminder in <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20220325T170000Z%2F20220325T210000Z&location=Valkiria%20HUB%2C%20Carrer%20de%20Pujades%2C%20126%2C%2008005%20Barcelona%2C%20Spain&text=Stable%20Show%20">your calendar</a>
</p>
<p>
<strong>Welcome in the Herd! <a href="https://stakedao.org/calendar">Get more info here</a> 🐘 👀 :</strong>
</p>

    `,
  attachments: [
    {
      filename: 'stable-show.jpeg',
      path: 'https://wedlocks.unlock-protocol.com/attachments/stable-show.jpeg',
      cid: 'stable-show.jpeg',
    },
  ],
}
