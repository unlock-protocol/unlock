const fetch = require('node-fetch')
const ethers = require('ethers')
const networks = require('@unlock-protocol/networks')

const getGdpForNetwork = async (provider, network, blockTag) => {
  const abi = ['function grossNetworkProduct() constant view returns (uint256)']

  const contract = new ethers.Contract(network.unlockAddress, abi, provider)
  let current = await contract.grossNetworkProduct({ blockTag })

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
    let value = await contract.grossNetworkProduct({ blockTag })
    return value.add(await getOldNetwork(previousDeploys))
  }
  if (network.previousDeploys) {
    const oldNetworksGdp = await getOldNetwork(network.previousDeploys)
    current = current.add(oldNetworksGdp)
  }

  return current
}

const getLastWeekBlockNumber = async (provider) => {
  const latestBlockNumber = await provider.getBlockNumber()
  const latestBlock = await provider.getBlock(latestBlockNumber)
  const numberOfBlocks = 10000
  const oldBlock = await provider.getBlock(latestBlockNumber - numberOfBlocks) //10,000 blocks ago!
  let timePerBlock =
    (latestBlock.timestamp - oldBlock.timestamp) / numberOfBlocks

  const weekInSeconds = 60 * 60 * 24 * 7
  return latestBlockNumber - parseInt(weekInSeconds / timePerBlock)
}

const priceConversion = async (network) => {
  if (network.isTestNetwork) {
    return 0
  }
  const response = await fetch(
    `https://api.coinbase.com/v2/exchange-rates?currency=${network.baseCurrencySymbol}`
  )

  const json = await response.json()
  return parseFloat(json.data.rates['USD'])
}

const run = async () => {
  const values = await Promise.all(
    Object.keys(networks).map(async (id) => {
      try {
        let network = networks[id]
        if (!network.unlockAddress) {
          return null
        }
        const provider = new ethers.providers.JsonRpcProvider(network.provider)
        const latestBlockNumber = await provider.getBlockNumber()
        const gdp = await getGdpForNetwork(provider, network, latestBlockNumber)
        // TODO: consider retrieving value "last week"...
        const rate = await priceConversion(network)
        const total = parseFloat(ethers.utils.formatUnits(gdp, '18'))
        return {
          id,
          total,
          dollars: total * rate,
        }
      } catch (error) {
        console.error('Error retrieving data for', id)
        console.error(error)
        return null
      }
    })
  )
  const prodNetworks = values.filter((x) => !!x)
  console.log(prodNetworks)
  const dollars = prodNetworks.map((n) => n.dollars).reduce((s, a) => s + a, 0)
  console.log(`$ total: ${dollars}`)
}

run()
