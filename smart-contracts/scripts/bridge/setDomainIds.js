const { ethers } = require('hardhat')

const domainIds = {
  5: 1735353714,
  80001: 9991
}

const purchaserAddresses = {
  5: '0x78ff4bbA01DAbfb235C395f8369f78770581F1f8',
  80001: '0x84d085898F6ae4ae8c4225f2601F29a10335F653'
}

async function main() {

  const { chainId } = await ethers.provider.getNetwork()
  
  const purchaserAddress = purchaserAddresses[chainId]
  const purchaser = await ethers.getContractAt('UnlockCrossChainPurchaser', purchaserAddress)
  
  console.log(`Setting chains info on ${purchaserAddress}...`)
  
  const args = [
    Object.keys(domainIds),
    Object.values(domainIds),
    Object.values(purchaserAddresses)
  ] 
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

