export default {
  subject: () => 'Your Dappcon NFT Ticket is on your wallet!',
  html: () =>
    `
<img src="cid:dappcon.png"/>
<p>Your NFT ticket to DappCon22 has been transferred to your wallet! Yay 🎉!
Look out for announcements as we approach the conference date. For now, lean back and enjoy the summer until DappCon22 starts🏖. </p>
<p>You can access your ticket using the <a href="https://app.unlock-protocol.com/keychain">Unlock key-chain</a> or in any other Gnosis Chain compatible NFT marketplace. Once we get closer to the conference your NFT ticket will turn into generative artwork created by sgt_sl8termelon. We’ll also send out more info about the check-in process as we approach the conference.</p>
<p>If you have any questions or need an invoice, please contact info@dappcon.io</p>
<p>Best wishes, 
The DappCon Team </p>
<p>Stay up to date and learn everything about the speaker and sponsor <a href="https://twitter.com/dappcon_berlin">@dappcon_berlin</a>.</p>
    `,
  attachments: [
    {
      filename: 'dappcon.png',
      path: 'https://wedlocks.unlock-protocol.com/attachments/dappcon.png',
      cid: 'dappcon.png',
    },
  ],
}
