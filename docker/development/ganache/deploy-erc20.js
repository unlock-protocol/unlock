/* eslint-disable no-console */
const ethers = require('ethers')
var fs = require('fs')

var testErc20Token = JSON.parse(
  fs.readFileSync(__dirname + '/TestErc20Token.json', 'utf8')
)
const decimals = 18

/**
 * A method which deploys an ERC20 contract
 * @param {*} providerUrl
 */
const deploy = async (provider, signer) => {
  let wallet = await provider.getSigner(signer)

  let factory = new ethers.ContractFactory(
    testErc20Token.abi,
    testErc20Token.bytecode,
    wallet
  )

  let erc20Contract = await factory.deploy({ gasLimit: 6000000 })
  await erc20Contract.deployed()

  return erc20Contract.address
}

/**
 * Transfers amount tokens to the recipient
 * @param {*} contractAddress
 * @param {*} recipient
 * @param {*} amount
 */
const transfer = async (
  provider,
  signer,
  contractAddress,
  recipient,
  amount
) => {
  let wallet = await provider.getSigner(signer)

  let erc20Contract = new ethers.Contract(
    contractAddress,
    testErc20Token.abi,
    wallet
  )

  return await erc20Contract.mint(
    recipient,
    ethers.utils.parseUnits(amount, decimals),
    {
      gasLimit: 6000000,
    }
  )
}

/**
 * Approves the transfer of amount from purchaserAddress to lockAddress on the contractAddress ERC20 contract
 * @param {*} provider
 * @param {*} contractAddress
 * @param {*} amount
 * @param {*} purchaserAddress
 * @param {*} lockAddress
 */
const approve = async (
  provider,
  contractAddress,
  amount,
  purchaserAddress,
  lockAddress
) => {
  let erc20Contract = new ethers.Contract(
    contractAddress,
    testErc20Token.abi,
    provider
  )

  let purchaserWallet = provider.getSigner(purchaserAddress)
  let contractWPurchaser = erc20Contract.connect(purchaserWallet)
  return await contractWPurchaser.approve(
    lockAddress,
    ethers.utils.parseUnits(amount, decimals)
  )
}

module.exports = {
  deploy,
  transfer,
  approve,
}
