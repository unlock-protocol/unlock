const ethers = require('ethers')
const networks = require('@unlock-protocol/networks')

const getGdpForNetwork = async (network) => {
  const abi = ['function grossNetworkProduct() constant view returns (uint256)']
  const provider = new ethers.providers.JsonRpcProvider(network.provider)

  if (!network.unlockAddress) {
    return 0
  }

  const contract = new ethers.Contract(network.unlockAddress, abi, provider)
  let current = await contract.grossNetworkProduct()

  const getOldNetwork = async (previousDeploys) => {
    let previousDeploy = previousDeploys.pop()
    if (!previousDeploy) {
      return 0
    }
    const contract = new ethers.Contract(
      previousDeploy.unlockAddress,
      abi,
      provider
    )
    let value = await contract.grossNetworkProduct()
    return value.add(await getOldNetwork(previousDeploys))
  }
  if (network.previousDeploys) {
    const oldNetworksGdp = await getOldNetwork(network.previousDeploys)
    current = current.add(oldNetworksGdp)
  }

  return current
}
const run = () => {
  Object.keys(networks).forEach(async (id) => {
    const gdp = await getGdpForNetwork(networks[id])
    console.log({
      id,
      total: ethers.utils.formatUnits(gdp, '18'),
    })
  })
}

run()
