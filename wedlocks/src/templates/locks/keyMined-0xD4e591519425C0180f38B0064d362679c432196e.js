export default {
  subject: () => 'You are going to DAO NYC Gathering!',
  text: (params) =>
    `Hi!
  
Your NFT ticket to DAO NYC Gathering has been sent to your wallet! Congrats! 🚀

Date: June 22 2022

Location:
Spring Studios
6 St Johns Ln
New York, NY 10013

For now, there is not much else you need to do. It should be visible on any NFT marketplace, but you can also see it in your Unlock key-chain:

${params.keychainUrl} (make sure you connect to the Polygon network!)

Once we get closer to the date of the event, we will send you instructions on how to make sure you can easily check-in.

If you have any questions, email us at help@dao-nyc.xyz

`,
}
