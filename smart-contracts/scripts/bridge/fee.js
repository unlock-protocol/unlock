const { ethers } = require("hardhat")
const { create } = require("@connext/sdk")
const addresses = require('./_addresses')


async function main() {

  const { chainId } = await ethers.provider.getNetwork()
  const [signer] = await ethers.getSigners()

  const { domainId: originDomain } = addresses[chainId]
  const destChainId = chainId === 5 ? 80001 : 5
  const { domainId : destinationDomain } = addresses[destChainId]

  const sdkConfig = {
    signerAddress: signer.address,
    network: "testnet", // can be "mainnet" or "testnet"
    chains: {
      [originDomain]: {
        providers: [`https://rpc.unlock-protocol.com/${chainId}`],
      },
      [destinationDomain]: {
        providers: [`https://rpc.unlock-protocol.com/${destChainId}`],
      },
    },
  }

  console.log(JSON.stringify(sdkConfig,null,2))


  const {sdkBase} = await create(sdkConfig);
  const params = {
    originDomain: originDomain.toString(), 
    destinationDomain: destinationDomain.toString(),
  }

  // Estimate the relayer fee
  const relayerFee = (await sdkBase.estimateRelayerFee(params)).toString()
  console.log(relayerFee)

  return relayerFee
}

// execute as standalone
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = main