const { ethers } = require('hardhat')
const { AddressZero } = ethers.constants

async function main({
  lockAddress,
}) {
  const [signer] = await ethers.getSigners()

    // get correct versio  of the lock abi
    const lock = await ethers.getContractAt(
      'contracts/PublicLock.sol:PublicLock',
      lockAddress
    )
    
    // eslint-disable-next-line no-console
    console.log('LOCK PURCHASE > Buying a key...')

    // purchase a bunch of keys
    const keyPrice = (await lock.keyPrice()).toString()
    const isErc20 = await lock.tokenAddress() !== AddressZero
    const args = [
      isErc20 ? [keyPrice] : [],
      [signer.address],
      [AddressZero],
      [AddressZero],
      [[]],
    ]
    const tx = await lock.purchase(
      ...args,
      { 
        value: isErc20 ? 0 : keyPrice,
      }
    )

    // get token ids
    const { events } = await tx.wait()
    const { args: { to, tokenId } } = events.find(({event}) => event === 'Transfer')
    console.log(`LOCK PURCHASE > key (${tokenId}) purchased by ${to}`)    
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
