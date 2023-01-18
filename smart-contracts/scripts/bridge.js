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
const WethABI = require('../test/helpers/ABIs/weth.json')
// const erc20ABI = require('../test/helpers/ABIs/erc20.json')
const { ZERO_ADDRESS } = require('@openzeppelin/test-helpers/src/constants')


/**
 * script to execute a simple bridged call example
 */

// unlock deployments
const unlockGoerli = '0xC6aa161C432b8c4454954E12eC8893DE2D38e216'
const unlockMumbai = '0x058b58dbd676063b90618a1eb0c02bb2d0f27adc'

// WETH
const WETHGoerli = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
const WETHMumbai = '0xFD2AB41e083c75085807c4A65C0A14FDD93d55A9'

// ERC20
const isERC20 = true
const ERC20Mumbai = '0xeDb95D8037f769B72AAab41deeC92903A98C9E16'
const ERC20Goerli = '0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1'

// lock mumbai 
const lockAddressMumbai = "0xcB145795F79DeA52b6c8F2d29cA1e81E7e99A0f2"

// lock Goerli (deployed from new unlock)
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

  // if(chainId === 80001) {
  //   const nonce = await ethers.provider.getTransactionCount(deployer.address)
  //   const pending = await ethers.provider.getTransactionCount(deployer.address, 'pending')
  //   if( nonce < pending ) {
  //     // unstuck polygon with some random tx
  //     const tx = await deployer.sendTransaction({
  //       to: deployer.address,
  //       nonce,
  //       gasLimit: 58000,
  //       gasPrice: ethers.utils.parseUnits('50', 'gwei')
  //       // data: 
  //     })
  //     await tx.wait()
  //   }
  // }
  
  
  let unlockAddress, lockAddress, destChainId, tokenAddress

  if(chainId == 80001) {
    unlockAddress = unlockMumbai

    destChainId = 5
    lockAddress = lockAddressGoerli

    if(isERC20) tokenAddress = ERC20Mumbai
    else tokenAddress = WETHMumbai
  } else if(chainId == 5) {    
    unlockAddress = unlockGoerli
    // wethAddress = WETHGoerli
  
    destChainId = 80001
    lockAddress = lockAddressMumbai 
    // NB: ZERO_ADDRESS will fail
    // tokenAddress = ZERO_ADDRESS
    if(isERC20) tokenAddress = ERC20Goerli
    else tokenAddress = WETHGoerli
  }
  

  const unlock = await ethers.getContractAt('Unlock', unlockAddress)

  const keyPrice = isERC20 ? 
    ethers.utils.parseEther('10') 
    : 
    ethers.BigNumber.from('10000000000000000')

  // fee should be zero for testnet
  const relayerFee = ethers.BigNumber.from('0')
  const slippage = 300 // in BPS

  console.log({
    unlockAddress,
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
    allowance = await token.allowance(deployer.address, unlock.address)
    console.log(`Balance (${await token.balanceOf(deployer.address)}) - Allowance (-> Unlock ) (${allowance.toString()})`)

    if (allowance.lt(keyPrice)) {
      throw Error(`Unsufficient Allowance (${allowance.toString()})`)
      // tx = await weth.approve(unlock.address, keyPrice)
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
  const tx = await unlock.sendBridgedLockCall(
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
