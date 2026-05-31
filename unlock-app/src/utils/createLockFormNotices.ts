export const shouldShowCreateLockNetworkWarning = (network: number) => {
  return network === 1
}

export const getCreateLockFaucetPrompt = ({
  faucetCount,
  nativeCurrencyName,
}: {
  faucetCount: number
  nativeCurrencyName: string
}) => {
  const faucetCopy =
    faucetCount > 1 ? 'Try one of these faucets:' : 'Try this faucet:'

  return `Need some ${nativeCurrencyName} to pay for gas? ${faucetCopy} `
}
