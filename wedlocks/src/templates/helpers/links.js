import handlebars from 'handlebars'

export function links(txUrl, openSeaUrl) {
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

  if (hasOpenSeaUrl) {
    linksMessage = `${linksMessage}
    <p></p>`
  }
  return new handlebars.SafeString(linksMessage)
}
