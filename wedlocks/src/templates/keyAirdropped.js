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
  subject: 'A new Membership NFT was airdropped to you',
  html: `<h1>A new Membership NFT was airdropped to you</h1>

<p>A new membership (#{{keyId}}) to the lock <strong>{{lockName}}</strong> was just airdropped for you!</p>

<p> You can transfer it to your own wallet by going to <a href="{{transferUrl}}">here</a>. You can also print Membership NFT as a signed QR code attached to this email. </p>

{{links txUrl openSeaUrl}}

`,
}
