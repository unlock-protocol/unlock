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
const addresses = require('./_addresses')
const estimateRelayerFee = require('./fee')

const isERC20 = false

async function main() {
  const [deployer] = await ethers.getSigners()
  const { chainId } = await ethers.provider.getNetwork()
  
  if (![80001, 5].includes(chainId))throw Error('Use mumbai or goerli plz')
  const destChainId = chainId == 80001 ? 5 : 80001
  
  console.log(`sending a call from ${chainId} > ${destChainId}`)

  const { 
    purchaserAddress,
    testERC20,
  } = addresses[chainId]

  // purchase info 
  const tokenAddress = isERC20 ? testERC20 : ZERO_ADDRESS
  
  // dest info 
  const lockAddress = addresses[destChainId][isERC20 ? 'testLockERC20' : 'testLockNative']

  // rate 
  const oneETH = ethers.utils.parseEther('1700') // 1700 MATIC
  const oneMATIC = ethers.BigNumber.from('6500000000000000') // 0.000613 ETH

  let keyPrice = isERC20 ? ethers.utils.parseEther('10') // 10 TEST
    : chainId === 5 ? oneMATIC.mul('10')// 10 MaTIC in ETH
    : oneETH.mul('0.01') // 0.01 ETH in MATIC
  
  // fee should be zero for testnet
  const relayerFee = ethers.BigNumber.from(await estimateRelayerFee())
  
  // in BPS
  const slippage = 300 

  console.log({
    purchaserAddress,
    destChainId,
    lockAddress,
    tokenAddress,
    isERC20,
    keyPrice: ethers.utils.formatEther(keyPrice),
    slippage,
    relayerFee: ethers.utils.formatUnits(relayerFee)
  })

  const purchaser = await ethers.getContractAt('UnlockCrossChainPurchaser', purchaserAddress)
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

  // make sure allowance is ok
  if(tokenAddress != ZERO_ADDRESS) {
    const token = await ethers.getContractAt(WethABI.abi, tokenAddress)
    const allowance = await token.allowance(deployer.address, purchaser.address)
    console.log(`Balance (${await token.balanceOf(deployer.address)}) - Allowance (${allowance.toString()})`)
    if (allowance.lt(keyPrice)) {
      throw Error(`Unsufficient Allowance (${allowance.toString()})`)
    }
  }

  // send bridged call
  const txArgs = [
    destChainId, // dest chainId,
    lockAddress, // lock on dest chain 
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
  console.log(args)
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
