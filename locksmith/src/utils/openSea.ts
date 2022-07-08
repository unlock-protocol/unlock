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
  const isTestNetwork = [4, 31337, 80001].includes(network)

  const baseUrl = isTestNetwork
    ? 'https://testnets.opensea.io'
    : 'https://opensea.io'

  return networks[network] && tokenId && lockAddress
    ? `${baseUrl}/assets/${lockAddress}/${tokenId}`
    : undefined
}
