import handlebars from 'handlebars'

handlebars.registerHelper('links', function (txUrl, openSeaUrl) {
  const hasTxUrl = txUrl?.length > 0
  const hasOpenSeaUrl = openSeaUrl?.length > 0
  let linksMessage = ''

  if (hasTxUrl && hasOpenSeaUrl) {
    linksMessage = `<p>You can also see it on a <a href="${txUrl}">block explorer</a> or even <a href="${openSeaUrl}">OpenSea</a>.</p>`
  } else if (hasTxUrl) {
    linksMessage = `<p>You can also see it on a <a href="${txUrl}">block explorer</a>.</p>`
  } else if (hasOpenSeaUrl) {
    linksMessage = `<p>You can also see it on <a href="${openSeaUrl}">OpenSea</a>.</p>`
  }
  return new handlebars.SafeString(linksMessage)
})

export default {
  subject: handlebars.compile('A key was added to your wallet!'),
  html: handlebars.compile(
    `<h1>A new NFT in your wallet!</h1>

<p>A new NFT key (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just minted for you!</p>

<p>It has been added to your <a href="{{keychainUrl}}">Unlock Keychain</a>, where you can view it and, if needed, print it as a signed QR Code!</p>

{{links txUrl openSeaUrl}}

`
  ),
}
