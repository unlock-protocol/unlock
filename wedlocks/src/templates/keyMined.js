const links = (params) => {
  const hasTxUrl = params?.txUrl?.length > 0
  const hasOpenSeaUrl = params?.openSeaUrl?.length > 0
  let linksMessage = ''

  if (hasTxUrl && hasOpenSeaUrl) {
    linksMessage = `You can also see it on a block explorer like ${params.txUrl} or even OpenSea ${params.openSeaUrl}.`
  } else if (hasTxUrl) {
    linksMessage = `You can also see it on a block explorer ${params.txUrl}.`
  } else if (hasOpenSeaUrl) {
    linksMessage = `You can also see it on OpenSea ${params.openSeaUrl}.`
  }
  if (linksMessage?.length) {
    return `\n${linksMessage}\n`
  }
  return linksMessage
}

export default {
  subject: () => 'A key was added to your wallet!',
  text: (params) =>
    `Hello!

A new NFT key (#${params.keyId}) to the lock "${
      params.lockName
    }" was just mined for you!
It has been added to your Unlock Keychain, where you can view it and, if needed, print it as a signed QR Code!

Check out your keychain: ${params.keychainUrl}
Make sure you select the network ${params.network} where the NFT has been minted for you.
${links(params)}
If you have any questions (or if you do not want to receive emails like this one in the future), please email us at hello@unlock-protocol.com.

The Unlock team
`,
}
