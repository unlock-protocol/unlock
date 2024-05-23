const { default: networks } = require('@unlock-protocol/networks')
const { ethers, Contract } = require('ethers')
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
  const [to, value, data, operation] = moduleCall
  const moduleArgs = [to, value, data, operation ? 1n : 0n]
  console.log(`${name} [${id}]: simulating execution on receving chain`)

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
  // override ownable for more recent OZ Ownable using OwnableStorageLocation
  await forkProvider.send('tenderly_setStorageAt', [
    delayMod,
    // storage location for owner
    '0x9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300',
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

  // 0ter. make sure we bypass pending txs in delay mod
  const delayModInstance = new Contract(delayMod, delayABI, signer)
  const currentNonce = await delayModInstance.txNonce()
  const nextNonce = await delayModInstance.queueNonce()
  if (currentNonce != nextNonce) {
    await signer.sendTransaction({
      from: signerAddress,
      to: delayMod,
      data: delayInterface.encodeFunctionData('setTxNonce', [nextNonce]),
      gasLimit: 800000,
    })
  }

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
      const network = Object.values(networks).find((network) =>
        network.governanceBridge
          ? network.governanceBridge.domainId.toString() ==
            destinationDomain.toString()
          : false
      )
      console.log(
        `${network.name} [${network.id}] Connext transfer ${transferId}`
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
