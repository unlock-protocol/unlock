const { default: networks } = require('@unlock-protocol/networks')
const { ethers } = require('ethers')
const { createFork } = require('./tenderly')
const { delayABI } = require('./bridge')

async function simulateDelayCall({ rpcUrl, projectURL, network, moduleCall }) {
  const {
    name,
    id,
    governanceBridge: {
      modules: { delayMod },
    },
  } = network

  // package module args
  const { to, value, data, operation } = moduleCall
  const moduleArgs = [to, value, data, operation ? 1n : 0n]

  console.log(`Simulating results for chain ${name} (${id})`)

  // ethers provider and signer
  const forkProvider = new ethers.JsonRpcProvider(rpcUrl)

  // send all tx as connext
  const [{ address: signerAddress }] = await forkProvider.listAccounts()

  const signer = await forkProvider.getSigner(signerAddress)

  // parse calls
  const delayInterface = new ethers.Interface(delayABI)

  // 0. override: set signer as owner 0xdc6bdc37b2714ee601734cf55a05625c9e512461
  await forkProvider.send('tenderly_setStorageAt', [
    delayMod,
    // storage location for owner
    '0x0000000000000000000000000000000000000000000000000000000000000033',
    // set to new address
    ethers.zeroPadValue(signerAddress, 32),
  ])

  // 0bis. enable signer as module
  await signer.sendTransaction({
    from: signerAddress,
    to: delayMod,
    data: delayInterface.encodeFunctionData('enableModule', [signerAddress]),
    gasLimit: 800000,
  })

  // 1. add tx to delay module
  await signer.sendTransaction({
    from: signerAddress,
    to: delayMod,
    data: delayInterface.encodeFunctionData(
      'execTransactionFromModule',
      moduleArgs
    ),
    gasLimit: 800000,
  })

  // 2. wait for a while
  const coolDown = 172800n // TODO: fetch from contract
  const params = [ethers.toQuantity(coolDown)]
  await forkProvider.send('evm_increaseTime', params)

  // 3. execute tx
  await signer.sendTransaction({
    from: signerAddress,
    to: delayMod,
    data: delayInterface.encodeFunctionData('executeNextTx', moduleArgs),
    gasLimit: 800000,
  })
  console.log(
    `${name} [${id}]: Simulation successful: check last tx at ${projectURL}`
  )
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
  console.log(destChainCalls)

  // simulate
  await Promise.all(
    destChainCalls.map(async ({ network, moduleCall }) => {
      // create a fork
      const fork = await createFork(network.id)

      // simulate calls on Tenderly
      await simulateDelayCall({
        ...fork,
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
