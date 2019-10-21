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
  let factory = new ethers.ContractFactory(
    externalRefund.abi,
    externalRefund.bytecode,
    wallet
  )

  let contract = await factory.deploy(lockAddress, refundAmount, tokenAddress, {
    gasLimit: 6000000,
  })

  let deployment = await contract.deployed()
  console.log('The External Refund was deployed: ', deployment.address)
}

module.exports = {
  deployExternalRefund,
}
