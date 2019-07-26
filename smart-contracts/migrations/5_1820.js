const erc1820 = require('erc1820')

module.exports = async function deploy1820(deployer, network) {
  // Deploy 1820 (for local testing only)
  if (network === 'development') {
    await erc1820.deploy(web3)
  }
}
