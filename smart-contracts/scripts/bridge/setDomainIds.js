const { ethers } = require('hardhat')
const addresses = ('./_addresses')

async function main() {

  const { chainId } = await ethers.provider.getNetwork()
  
  const { purchaserAddress } = addresses[chainId]
  const purchaser = await ethers.getContractAt('UnlockCrossChainPurchaser', purchaserAddress)
  
  console.log(`Setting chains info on ${purchaserAddress}...`)
  
  const args = [[], [], []]
  Object.keys(addresses).forEach(id => {
    const { domainId, purchaserAddress} = addresses[id]
    args[0] = [...args[0], id]
    args[1] = [...args[1], domainId]
    args[2] = [...args[2], purchaserAddress]
  })
  console.log(args)
  
  const tx = await purchaser.setCrossChainPurchasers(...args)
  
  console.log(`Done at ${tx.hash}`)
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

