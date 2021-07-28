const { ethers, upgrades } = require('hardhat')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const network = 'mainnet'

async function main() {
  const [UDTInfo] =
    OZ_SDK_EXPORT.networks[network].proxies[
      'unlock-protocol/UnlockDiscountToken'
    ]

  const UDTV2 = await ethers.getContractFactory('UnlockDiscountTokenV2')
  const implementation = await upgrades.prepareUpgrade(UDTInfo.address, UDTV2)

  // eslint-disable-next-line no-console
  console.log(`UDT V2 implementation deployed at: ${implementation}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
