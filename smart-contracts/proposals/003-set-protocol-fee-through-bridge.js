/**
 * This demonstrate how to send a call from the DAO accross the bridge to update
 * Unlock params
 * 
 * yarn hardhat gov:submit --gov-address 0xDcDE260Df00ba86889e8B112DfBe1A4945B35CA9 \
 * --proposal proposals/002-set-protocol-fee.js \
 * --network goerli
 */
const { ethers } = require('hardhat')

const { parseUnlockOwnerCalldata } = require('../helpers/gov')
const bridge = require('../helpers/bridge')
const { ADDRESS_ZERO } = require('../test/helpers')

async function main () {
  const { chainId } = await ethers.provider.getNetwork()

  // make sure chain is correct
  if (chainId.toString() !== '5') {
    throw Error(`calls are only send from Goerli/Mainnet (chain ${chainId})`)
  }

  // proposed changes
  const protocolFee = ethers.utils.parseEther('0.000001')
  const proposalName = `[Bridge] Set protocol fee to ${protocolFee} on Mumbai`

  // parse Unlock call data
  const unlockOwnerCalldata = await parseUnlockOwnerCalldata({
    action: 1,
    functionName: 'setProtocolFee',
    functionArgs: [ protocolFee ],
  })

  // send changes to mumbai
  const destChainId = 80001
  const { unlockOwnerAddress, bridgeAddress, domainId } = bridge[destChainId]

  // parse bridge call
  const functionArgs = [
    domainId, // _destination: Domain ID of the destination chain
    unlockOwnerAddress, // _to: address of the target contract 
    ADDRESS_ZERO, // _asset: use address zero for 0-value transfers    
    ADDRESS_ZERO, // _delegate: address that can revert or forceLocal on destination    
    0, // _amount: 0 because no funds are being transferred
    30, // _slippage: can be anything between 0-10000 because no funds are being transferred    
    unlockOwnerCalldata, // _callData: the encoded calldata to send    
  ]

  // parse Gov proposal for bridge call
  const proposalArgs = {
    contractName: 'IConnext',
    contractAddress: bridgeAddress,
    functionName: 'xcall',
    functionArgs,
    proposalName 
  }

  console.log(proposalArgs)

  return proposalArgs
}

module.exports = main