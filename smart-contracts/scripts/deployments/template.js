const { ethers } = require('hardhat')
const WETH = require('hardlydifficult-eth/src/tokens/weth.json')

async function main() {
    
    const PublicLock = await ethers.getContractFactory('PublicLock')
    const publicLock = await PublicLock.deploy()
    await publicLock.deployed()

    // eslint-disable-next-line no-console
    console.log(`PUBLC LOCK > deployed to : ${publicLock.address} (${publicLock.deployTransaction.hash })`)
    // eslint-disable-next-line no-console
    console.log(`PUBLC LOCK > Please verify it and call setTemplate on the Unlock.`)
    return publicLock.address
}

// execute as standalone
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error)
            process.exit(1)
        })
}

module.exports = main
