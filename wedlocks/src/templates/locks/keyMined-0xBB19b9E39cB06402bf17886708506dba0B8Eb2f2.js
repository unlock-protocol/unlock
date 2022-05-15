export default {
  subject: () => 'DeFi Arena',
  html: () =>
    `
<img src="cid:defi-arena.jpeg"/>
<p>Congrats, you have successfully reserved your ticket for the event!</p>

<p>
<aside>
📌 The sun is slowly setting over the vibrant city of Barcelona. The DeFi thinkers meet for a moment of discussion to address the issues they have encountered since the first hour of DeFi and look forward with the last rays of the day to the next challenges that await them in their daily mission to build the future of the financial and economic application of blockchain.<br />
Of course it's the occasion to give the kick-off of the Celo connect conference (we think of you and spare you to be a little bit too tired on the first day of what will be a great moment of the crypto ecosystem).
</aside>

<p>
📯 Add it to your <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20220402T160000Z%2F20220402T220000Z&location=Sir Victor Hotel %3B CARRER DEL ROSSELLÓ 265%2C 08008%2C BARCELONA%2C SPAIN&text=DeFi Arena">calendar</a>.
<strong>Find <a href="https://stakedao.org/calendar">more alphas here 🐘 👀 </a></strong>
</p>
    `,
  attachments: [
    {
      filename: 'defi-arena.jpeg',
      path: 'https://wedlocks.unlock-protocol.com/attachments/defi-arena.jpeg',
      cid: 'defi-arena.jpeg',
    },
  ],
}
