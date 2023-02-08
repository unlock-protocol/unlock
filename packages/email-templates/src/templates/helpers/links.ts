import handlebars from 'handlebars'

export function links(txUrl: string, openSeaUrl: string, airdropped: boolean) {
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

  if (hasOpenSeaUrl && airdropped) {
    linksMessage = `${linksMessage}
    <p>
      Sometimes, OpenSea will hide NFTs in your wallet that have been airdropped. Follow these steps to show them:
    </p>
    <ol>
      <li>Navigate to the More → Hidden tab on your OpenSea profile.</li>
      <li>On the bottom right corner of your NFT, click the three-dot menu. (If you don't see this option, check to see if you're in Gallery view.)
      <li>Select Unhide.
      <li>Once you've selected the items you'd like to unhide, click Continue.
      <li>You'll see a confirmation message and the item will move back to the Collected tab.</li>
    </ol>
   `
  }
  return new handlebars.SafeString(linksMessage)
}
