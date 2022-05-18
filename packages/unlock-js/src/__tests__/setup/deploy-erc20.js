/* eslint-disable no-console */
const path = require('path')
const { ethers } = require('hardhat')
let fs = require('fs-extra')

const testErc20Token = fs.readJSONSync(
  path.join(__dirname, 'TestErc20Token.json')
)
const decimals = 18
/**
 * A method which deploys an ERC20 contract
 * @param {*} providerUrl
 */
const deploy = async (provider, signer) => {
  const factory = await ethers.getContractFactory(
    testErc20Token.abi,
    testErc20Token.bytecode,
    signer
  )

  const erc20Contract = await factory.deploy()
  await erc20Contract.deployed()

  return erc20Contract
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
  let erc20Contract = new ethers.Contract(
    contractAddress,
    testErc20Token.abi,
    signer
  )

  const mintTx = await erc20Contract.mint(
    recipient,
    ethers.utils.parseUnits(amount, decimals)
  )
  return await mintTx.wait()
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
  const approveTx = await contractWPurchaser.approve(
    lockAddress,
    ethers.utils.parseUnits(amount, decimals)
  )
  return await approveTx.wait()
}

module.exports = {
  deploy,
  transfer,
  approve,
}
