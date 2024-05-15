const { default: networks } = require('@unlock-protocol/networks')
const { ethers } = require('ethers')
const { createFork } = require('./tenderly')
const { delayABI } = require('./bridge')

async function simulateDelayCall({ rpcUrl, network, moduleCall }) {
  const {
    name,
    id,
    governanceBridge: {
      modules: { delayMod, connextMod },
    },
  } = network

  const {
    to, // to
    value, // value
    data, // data
    operation,
  } = moduleCall

  console.log({
    to, // to
    value, // value
    data, // data
    operation,
  })

  console.log(
    `To simulate results on receiving end - chain ${name} (${id})
  - call \`execTransactionFromModule\` on contract ${delayMod} with from set as ${connextMod}
  - wait for cooldown period (default: +172800)
  - call \`executeNexTx\` on contract ${delayMod} with from set as ${connextMod}
  `
  )
  // ethers provider and signer
  const forkProvider = new ethers.JsonRpcProvider(rpcUrl)

  // send all tx as connext
  const signer = await forkProvider.getSigner(connextMod)

  // parse calls
  const delayInterface = new ethers.Interface(delayABI)

  // 1. add tx to delay module
  await signer.sendTransaction({
    from: connextMod,
    to: delayMod,
    data: delayInterface.encodeFunctionData('execTransactionFromModule', [
      to,
      value,
      data,
      operation ? 1n : 0n,
    ]),
    gasLimit: 800000,
  })

  // 2. wait for a while
  const coolDown = 172800n // TODO: fetch from contract
  const params = [ethers.toQuantity(coolDown)]
  await forkProvider.send('evm_increaseTime', params)
  console.log(`> skipping cool down period: advancing ${coolDown} seconds`)

  // 3. execute tx
  await signer.sendTransaction({
    from: connextMod,
    to: delayMod,
    data: delayInterface.encodeFunctionData('executeNexTx', [
      to,
      value,
      data,
      operation,
    ]),
    gasLimit: 800000,
  })
}

async function simulateDestCalls(xCalls) {
  // parse multisig calls from xCall events
  const abiCoder = ethers.AbiCoder.defaultAbiCoder()
  const destChainCalls = xCalls.map(
    ({ transferId, params: { callData, destinationDomain } }) => {
      console.log(`------- Connext transfer ${transferId}`)

      const network = Object.values(networks).find((network) =>
        network.governanceBridge
          ? network.governanceBridge.domainId.toString() ==
            destinationDomain.toString()
          : false
      )
      const moduleCall = abiCoder.decode(
        ['address', 'uint256', 'bytes', 'bool'],
        callData
      )

      return {
        network,
        moduleCall,
      }
    }
  )
  // simulate
  await Promise.all(
    destChainCalls.map(async ({ network, moduleCall }) => {
      // create a fork
      const { rpcUrl } = await createFork(network.id)
      console.log('Fork URL\n\t' + rpcUrl)

      // simulate calls on Tenderly
      await simulateDelayCall({
        rpcUrl,
        network,
        moduleCall,
      })
    })
  )
}

module.exports = {
  simulateDestCalls,
  simulateDelayCall,
}
