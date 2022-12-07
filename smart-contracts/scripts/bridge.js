const { ethers } = require('hardhat')
const WethABI = require('../test/helpers/ABIs/weth.json')
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants')


/**
 * script to execute a simple bridged call example
 */

// unlock deployments
const unlockGoerli = '0xC6aa161C432b8c4454954E12eC8893DE2D38e216'
const unlockMumbai = '0x058b58dbd676063b90618a1eb0c02bb2d0f27adc'

// WETH
const WETHGoerli = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const WETHMumbai = '0xfd2ab41e083c75085807c4a65c0a14fdd93d55a9'

// free lock mumbai native currency MATIC
const lockAddressMumbai = "0xcB145795F79DeA52b6c8F2d29cA1e81E7e99A0f2"

//lock deployed from new unlock on Goerli priced in WETH
const lockAddressGoerli = "0xde81091C88b56Cb7A1eCd077ac9750a5129C9953"


async function main() {
  const [deployer] = await ethers.getSigners()
  
  // Unlock deployment
  // const Unlock = await ethers.getContractFactory('contracts/Unlock.sol:Unlock')
  // const fragment = Unlock.interface.getFunction('initialize')
  // const data = Unlock.interface.encodeFunctionData(fragment, [deployer.address])
  // const unlockAddress = '0x36f1Ff99c094F313BE647649F82B19A83e766d2B'
  // const proxyAdminAddress = '0x604fA8712E61fe65db326F97905Efcb087C631Cc'

  const { chainId } = await ethers.provider.getNetwork()
  console.log(`sending a call from ${chainId}`)
  if (![80001, 5].includes(chainId))throw Error('Use mumbai or goerli plz')
  // check nonce for polygon stuck txs :(
  // https://gasstation-mainnet.matic.network/v2
  // const FEE_DATA = {
  //   maxFeePerGas:         ethers.utils.parseUnits('150', 'gwei'),
  //   maxPriorityFeePerGas: ethers.utils.parseUnits('100',   'gwei'),
  // } 

  if(chainId === 80001) {
    const nonce = await ethers.provider.getTransactionCount(deployer.address)
    const pending = await ethers.provider.getTransactionCount(deployer.address, 'pending')
    if( nonce < pending ) {
      // unstuck polygon with some random tx
      const tx = await deployer.sendTransaction({
        to: deployer.address,
        nonce,
        gasLimit: 58000,
        gasPrice: ethers.utils.parseUnits('50', 'gwei')
        // data: 
      })
      await tx.wait()
    }
  }
  
  
  let unlockAddress, lockAddress, destChainId, tokenAddress

  if(chainId == 80001) {
    unlockAddress = unlockMumbai

    destChainId = 5
    lockAddress = lockAddressGoerli
    tokenAddress = WETHMumbai
  } else if(chainId == 5) {    
    unlockAddress = unlockGoerli
    // wethAddress = WETHGoerli
  
    destChainId = 80001
    lockAddress = lockAddressMumbai 
    // NB: ZERO_ADDRESS will fail
    // tokenAddress = ZERO_ADDRESS
    tokenAddress = WETHGoerli
  }
  console.log({
    unlockAddress,
    destChainId,
    lockAddress,
    tokenAddress
  })

  const unlock = await ethers.getContractAt('Unlock', unlockAddress)

  if(tokenAddress != ZERO_ADDRESS) {
    const weth = await ethers.getContractAt(WethABI.abi, tokenAddress)
    console.log(await weth.allowance(deployer.address, unlock.address))
    // tx = await weth.approve(unlock.address, keyPrice)
    // await tx.wait()
  }

  const keyPrice = ethers.BigNumber.from('10000000000000000')
  // fee should be zero for testnet
  const relayerFee = ethers.BigNumber.from('0')
  const value = tokenAddress == ZERO_ADDRESS ? relayerFee.add(keyPrice) : relayerFee
  const slippage = 300 // in BPS

  // parse call data   
  const PublicLock = await ethers.getContractFactory('contracts/PublicLock.sol:PublicLock')
  const purchaseArgs = [
    tokenAddress == ZERO_ADDRESS ? [] : [keyPrice],
    ['0x81a662065d5c83Fa9c5C12d0dc0104dF57f85A12'],
    ['0x0000000000000000000000000000000000001010'],
    ['0x0000000000000000000000000000000000001010'],
    [[]],
  ]
  const { interface } = PublicLock
  const calldata = interface.encodeFunctionData('purchase', purchaseArgs)
  
  // send bridged call
  const args = [
    destChainId, // destChainId,
    lockAddress, // lock.address,
    tokenAddress, // from src chain
    keyPrice,
    calldata,
    relayerFee,
    slippage
  ]
  console.log(args, { value })
  const tx = await unlock.sendBridgedLockCall(
    ...args, 
    { 
      value,
    }
  )
  console.log(tx)
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
