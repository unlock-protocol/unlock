import handlebars from 'handlebars'

handlebars.registerHelper('links', function (txUrl, openSeaUrl) {
  const hasTxUrl = txUrl?.length > 0
  const hasOpenSeaUrl = openSeaUrl?.length > 0
  let linksMessage = ''

  if (hasTxUrl && hasOpenSeaUrl) {
    linksMessage = `\nYou can also see it on a block explorer like ${txUrl} or even OpenSea ${openSeaUrl}.\n`
  } else if (hasTxUrl) {
    linksMessage = `\nYou can also see it on a block explorer ${txUrl}.\n`
  } else if (hasOpenSeaUrl) {
    linksMessage = `\nYou can also see it on OpenSea ${openSeaUrl}.\n`
  }
  return linksMessage
})

export default {
  subject: handlebars.compile('A key was added to your wallet!'),
  text: handlebars.compile(
    `Hello!

A new NFT key (#{{keyId}}) to the lock "{{
      lockName
    }}" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: {{keychainUrl}}
Make sure you select the network {{
      network
    }} where the NFT has been minted for you.
{{links txUrl openSeaUrl}}
If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`
  ),
}
