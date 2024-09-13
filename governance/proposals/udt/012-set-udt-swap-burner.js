/**
 * This proposal send calls accross the bridge to set swap burner
 * in Unlock on Arbitrum, Base, and Optimism.
 */
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const { Unlock } = require('@unlock-protocol/contracts')
const { parseSafeMulticall, getProvider } = require('../../helpers/multisig')
const { ethers } = require('hardhat')
const { Contract } = require('ethers')
const { parseBridgeCall } = require('../../helpers/crossChain')

const targetChainsIds = [
  42161, // Arbitrum
  8453, // Base
  10, // Optimism
]

// TODO: deploy swap burner contracts
const swapBurnerAddresses = {
  42161: '0x316A4650e70594FA3D947a43A237bEF427Bd80d6', // Arbitrum
  8453: '0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591', // Base
  10: '0xd8250925527e769d90C6F2Fc55384B9110f26b62', // Optimism
}

const parseCalls = async (destChainId) => {
  const { unlockAddress, unlockDaoToken, nativeCurrency, explorer } =
    await getNetwork(destChainId)
  const swapBurnerAddress = swapBurnerAddresses[destChainId]

  const provider = await getProvider(destChainId)

  // get Unlock interface
  const unlock = new Contract(unlockAddress, Unlock.abi, provider)

  if (BigInt(destChainId) !== (await unlock.chainId())) {
    throw new Error(
      `Mismatch btw ${destChainId} and Unlock settings ${await unlock.chainId()}`
    )
  }

  // parse config args
  const estimatedGasForPurchase = 200000n
  const configUnlockArgs = [
    unlockDaoToken.address,
    nativeCurrency.wrapped,
    estimatedGasForPurchase,
    await unlock.globalTokenSymbol(),
    await unlock.globalBaseTokenURI(),
    await unlock.chainId(),
  ]

  console.log(configUnlockArgs)

  const calls = [
    {
      contractAddress: unlockAddress,
      calldata: unlock.interface.encodeFunctionData('setSwapBurner', [
        swapBurnerAddress,
      ]),
      value: 0,
      operation: 1,
    },
    {
      contractAddress: unlockAddress,
      calldata: unlock.interface.encodeFunctionData(
        'configUnlock',
        configUnlockArgs
      ),
      value: 0,
      operation: 1,
    },
  ]

  // parse multicall
  const { to, data, value, operation } = await parseSafeMulticall({
    chainId: destChainId,
    calls,
  })

  // encode multicall instructions to be executed by the SAFE
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const moduleData = abiCoder.encode(
    ['address', 'uint256', 'bytes', 'bool'],
    [
      to, // to
      value, // value
      data, // data
      operation, // operation: 0 for CALL, 1 for DELEGATECALL
    ]
  )

  const configUnlockKeys = [
    '_udt',
    '_weth',
    '_estimatedGasForPurchase',
    '_symbol',
    '_URI',
    '_chainId',
  ]

  const explainer = `Changes sent to the Unlock contract at ${unlockAddress}

1. call \`configUnlock\` with the following parameters 

${configUnlockArgs
  .map((val, i) => `  - ${configUnlockKeys[i]}: ${val}`)
  .join('\n')}

2. call \`setSwapBurner(${swapBurnerAddress})\` and set the [SwapBurner](${explorer.urls.address(
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
  const title = `Set UDT and SwapBurner in Unlock contract on Arbitrum, Base and Optimism`

  const proposalName = `${title}

## Goal of the proposal

This proposal sets 1) the UDT address and 2) the Swap Burner contract address in the main Unlock factory contract on the following chains: ${targetChains
    .map(({ name }) => name)
    .toString()}. 
  
## About this proposal

Now that UDT has been bridged to Arbitrum, Base and Optimism, the new address has to be set in the main Unlock contract for the tokens to be distributed or swap/burned. For that, we call the \`configUnlock\` function with the bridge UDT address as parameter (keeping other parameters untouched).

A \`SwapBurner\` helper contract has been deployed on all three chains and will be added as setting to the main Unlock contract. This will enable the “swap and burn” feature of fees collected by the protocol on these chains, following the deployment of bridged versions of UDT there.

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
