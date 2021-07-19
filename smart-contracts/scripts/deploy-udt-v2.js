const { ethers, upgrades } = require('hardhat')
const OZ_SDK_EXPORT = require('../openzeppelin-cli-export.json')

const network = 'rinkeby' // mainnet

async function main() {
  const [UDTInfo] =
    OZ_SDK_EXPORT.networks[network].proxies[
      'unlock-protocol/UnlockDiscountToken'
    ]

  const UDTV2 = await ethers.getContractFactory('UnlockDiscountTokenV2')
  await upgrades.upgradeProxy(UDTInfo.address, UDTV2)

  // eslint-disable-next-line no-console
  console.log('UDT upgraded to V2')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error)
    process.exit(1)
  })
