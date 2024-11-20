/**
 * This proposal send calls accross the bridge to set swap burner
 * in Unlock on Arbitrum, Base, and Optimism.
 */
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { getProvider } = require('../../helpers/multisig')
const { ethers } = require('hardhat')
const { Contract } = require('ethers')
const { parseBridgeCall } = require('../../helpers/crossChain')

const swapBurnerAddresses = {
  1: '0xfA3F427d2691ce680f96E6916a9Dac6c9042CBd2', // mainnet
  137: '0x52690873b22B0949A3A2c1AaD22653218460A002', // polygon
}

const targetChainsIds = Object.keys(swapBurnerAddresses)

const parseCalls = async (destChainId) => {
  const { unlockAddress, unlockDaoToken, nativeCurrency, explorer } =
    await getNetwork(destChainId)
  const swapBurnerAddress = swapBurnerAddresses[destChainId]
  if (!unlockDaoToken) {
    throw new Error(`No unlockDaoToken for chain ${destChainId}`)
  }
  const provider = await getProvider(destChainId)

  // get Unlock interface
  const unlock = new Contract(unlockAddress, Unlock.abi, provider)

  if (BigInt(destChainId) !== (await unlock.chainId())) {
    throw new Error(
      `Mismatch btw ${destChainId} and Unlock settings ${await unlock.chainId()}`
    )
  }

  // encode multicall instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      unlockAddress, // to
      0, // value
      unlock.interface.encodeFunctionData('setSwapBurner', [swapBurnerAddress]), // data
      0, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )

  const explainer = `Changes sent to the Unlock contract at ${unlockAddress}

  call \`setSwapBurner(${swapBurnerAddress})\` and set the [SwapBurner](${explorer.urls.address(
    swapBurnerAddress
  )}) contract
  `

  return { moduleData, explainer }
}

module.exports = async () => {
  const explainers = []
  const targetChains = await Promise.all(
    targetChainsIds.map((id) => getNetwork(id))
  )

  // get setProtocolFee call data for dest chains
  const calls = []
  for (let i in targetChains) {
    const { name, id: chainId } = targetChains[i]
    console.log(`Parsing for chain ${name} (${chainId})`)
    const { moduleData, explainer } = await parseCalls(chainId)
    const bridgedCall = await parseBridgeCall({
      destChainId: chainId,
      moduleData,
    })
    calls.push(bridgedCall)
    explainers.push({
      name,
      id: chainId,
      explainer: explainer,
    })
  }

  console.log({ explainers, calls })

  // parse proposal
  const title = `Set SwapBurner in Unlock contract on Mainnet and Polygon`

  const proposalName = `${title}

## Goal of the proposal

This proposal sets the Swap Burner contract address in the main Unlock factory contract on the following chains: ${targetChains
    .map(({ name }) => name)
    .toString()}. 
  
## About this proposal

A \`SwapBurner\` helper contract has been deployed on all three chains and will be added as a setting to the main Unlock contract. This will enable the “swap and burn” feature of fees collected by the protocol on these chains, following the deployment of bridged versions of UDT there.

## How it works

The proposal uses a cross-chain proposal pattern that, once passed, will send the calls to multiple chains at once. This pattern has been introduced and tested in a [previous proposal](https://www.tally.xyz/gov/unlock/proposal/1926572528290918174819693611122933562560576845671089759587616947457423587439). 

## The calls

This DAO proposal contains ${calls.length} calls:

${explainers
  .map(
    ({ name, id, explainer: exp }) => `### ${name} (${id}) 1 call

  ${exp}
  `
  )
  .join('\n\n')}

  
The Unlock Protocol Team
`
  console.log(proposalName)
  console.log(calls)

  // send to multisig / DAO
  return {
    proposalName,
    calls,
  }
}
