var fs = require('fs')
const ethers = require('ethers')

var externalRefund = JSON.parse(
  fs.readFileSync(__dirname + '/ExternalRefund.json', 'utf8')
)

async function deployExternalRefund(
  lockAddress,
  refundAmount,
  tokenAddress,
  provider
) {
  let wallet = await provider.getSigner(0)
  const walletAddress = await wallet.getAddress()
  let factory = new ethers.ContractFactory(
    externalRefund.abi,
    externalRefund.bytecode,
    wallet
  )

  let contract = await factory.deploy(lockAddress, refundAmount, tokenAddress, {
    gasLimit: 6000000,
  })

  let deployment = await contract.deployed()

  // the "first" account (typically
  // 0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2) is admin of the
  // contract, but is not whitelisted by default. So after we deploy
  // the contract, we enable that address to perform refunds.
  let abi = [
    'function addWhitelisted(address account)',
  ]
  let deployedContract = new ethers.Contract(deployment.address, abi, wallet)
  await deployedContract.addWhitelisted(walletAddress)
  
  console.log('The External Refund was deployed:   ', deployment.address)
  console.log('The External Refund contract admin: ', walletAddress)
  console.log(`The External Refund lock address:   ${lockAddress}`)
}

module.exports = {
  deployExternalRefund,
}
