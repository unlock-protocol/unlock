import networks from '@unlock-protocol/networks'

export const generateOpenSeaUrl = ({
  lockAddress,
  tokenId,
  network,
}: {
  lockAddress: string
  tokenId: string
  network: any
}): string | undefined => {
  const isTestNetwork = networks[network]?.isTestNetwork ?? true

  const baseUrl = isTestNetwork
    ? 'https://testnets.opensea.io'
    : 'https://opensea.io'

  return networks[network] && tokenId && lockAddress
    ? `${baseUrl}/assets/${lockAddress}/${tokenId}`
    : undefined
}
