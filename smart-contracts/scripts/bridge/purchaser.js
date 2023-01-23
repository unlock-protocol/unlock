/**
 * Send a bridged call from once chain to another
 * 
 * To track a call:
 * 
 * - send a call using this script
 * - check the call status on the bridge explorer https://testnet.amarok.connextscan.io/
 * or using the subgraph (see https://docs.connext.network/developers/guides/xcall-status)
 * - 
 */
const { ethers } = require('hardhat')
const WethABI = require('../../test/helpers/ABIs/weth.json')
// const erc20ABI = require('../test/helpers/ABIs/erc20.json')
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants')
const { 
  purchaserAddresses,
  wethAddresses,
  testERC20s,
  testLocks,
 } = require('./_addresses')


/**
 * script to execute a simple bridged call example
 */

// ERC20
const isERC20 = true


async function main() {
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  console.log(`sending a call from ${chainId}`)

  if (![80001, 5].includes(chainId))throw Error('Use mumbai or goerli plz')

  const destChainId = chainId == 80001 ? 5 : 80001
  const purchaserAddress = purchaserAddresses[chainId]
  const lockAddress = testLocks[chainId]    
  const tokenAddress = isERC20 ? testERC20s[chainId] : wethAddresses[chainId]
  

  const purchaser = await ethers.getContractAt('UnlockCrossChainPurchaser', purchaserAddress)

  const keyPrice = isERC20 ? 
    ethers.utils.parseEther('10') 
    : 
    ethers.BigNumber.from('10000000000000000')

  // fee should be zero for testnet
  const relayerFee = ethers.BigNumber.from('0')
  const slippage = 300 // in BPS

  console.log({
    purchaserAddress,
    destChainId,
    lockAddress,
    tokenAddress,
    isERC20,
    keyPrice: ethers.utils.formatEther(keyPrice),
    slippage,
    relayerFee,
  })

  if(tokenAddress != ZERO_ADDRESS) {
    let allowance 
    let token
    if(isERC20) {
      // token = await ethers.getContractAt(erc20ABI.abi, tokenAddress)
      token = await ethers.getContractAt(WethABI.abi, tokenAddress)
    }
    allowance = await token.allowance(deployer.address, purchaser.address)
    console.log(`Balance (${await token.balanceOf(deployer.address)}) - Allowance (${allowance.toString()})`)

    if (allowance.lt(keyPrice)) {
      throw Error(`Unsufficient Allowance (${allowance.toString()})`)
      // tx = await weth.approve(purchaser.address, keyPrice)
      // await tx.wait()
    }
  }

  const value = tokenAddress == ZERO_ADDRESS ? relayerFee.add(keyPrice) : relayerFee

  // parse call data   
  const PublicLock = await ethers.getContractFactory('contracts/PublicLock.sol:PublicLock')
  const purchaseArgs = [
    tokenAddress == ZERO_ADDRESS ? [] : [keyPrice],
    ['0x81a662065d5c83Fa9c5C12d0dc0104dF57f85A12'],
    ['0x0000000000000000000000000000000000000000'],
    ['0x0000000000000000000000000000000000000000'],
    [[]],
  ]
  const { interface } = PublicLock
  const calldata = interface.encodeFunctionData('purchase', purchaseArgs)
  
  // send bridged call
  const txArgs = [
    destChainId, // destChainId,
    lockAddress, // lock.address,
    tokenAddress, // from src chain
    keyPrice,
    calldata,
    relayerFee,
    slippage
  ]
  console.log(txArgs, { value })
  const tx = await purchaser.sendBridgedLockCall(
    ...txArgs, 
    { 
      value,
    }
  )
  const { events } = await tx.wait()
  const { args } = events.find(({event}) => event === 'BridgeCallEmitted')
  console.log(`Call emitted to chain ${args.destChainId} with transferID: ${args.transferID}`)
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
