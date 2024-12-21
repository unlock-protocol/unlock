const {
  targetChains,
  DelayMod: delayModAbi,
  ConnextMod: connextModAbi,
} = require('../../helpers/bridge')
const { UPGovernor } = require('@unlock-protocol/contracts')
const { networks } = require('@unlock-protocol/networks')

const { getProvider } = require('../../helpers/multisig')
const { Contract } = require('ethers')

const isExpired = async (delayMod, nonce) => {
  const createdAt = await delayMod.getFunction('getTxCreatedAt')(nonce)
  const expiration = await delayMod.getFunction('txExpiration')()
  const deadline = createdAt + expiration
  const now = BigInt(parseInt(Date.now() / 1000))
  return deadline < now
}

async function main() {
  for (let i in targetChains) {
    const {
      id,
      name,
      multisig,
      dao: {
        chainId: daoChainId,
        governor,
        governanceBridge: {
          modules: { delayMod: delayModAddress, connextMod: connextModAddress },
        },
      },
    } = targetChains[i]

    const log = (msg) => console.log(`[${name} (${id})] ${msg}`)

    // get domain ID for base
    const { domainId: daoDomainId } = networks[daoChainId].dao.governanceBridge

    // get timelock address
    const daoChainProvider = await getProvider(daoChainId)
    const gov = new Contract(governor, UPGovernor.abi, daoChainProvider)
    const daoTimelockAddress = await gov.timelock()

    // parse Delay contract
    const provider = await getProvider(id)
    const delayMod = new Contract(delayModAddress, delayModAbi, provider)
    const connextMod = new Contract(connextModAddress, connextModAbi, provider)

    // make sure SAFE modules config is correct
    if (
      (await delayMod.getFunction('target')()) != multisig ||
      (await connextMod.getFunction('target')()) != delayModAddress
    ) {
      log(`Config error in SAFE modules. Should be:
    - delayMod target : ${multisig} (currently: ${await delayMod.getFunction('target')()})
    - connextMod target ${delayModAddress} (currently: ${await connextMod.getFunction('target')()})
    `)
    }

    // check ownership of the modules
    if ((await delayMod.owner()) != multisig) {
      log('Incorrect ownership of SAFE Delay module.')
    }
    if ((await connextMod.owner()) != multisig) {
      log(
        `Incorrect ownership of SAFE Connext module. ${await connextMod.owner()}`
      )
    }

    // make sure the connext bridge module is set correctly to DAO coordinates on Base
    if (
      (await connextMod.originSender()) != daoTimelockAddress ||
      (await connextMod.origin()) != daoDomainId
    ) {
      log(
        `Incorrect config for SAFE Connext module origin ${await connextMod.origin()} and origin sender ${await connextMod.originSender()}.`
      )
    }

    // get nonces
    const currentNonce = await delayMod.txNonce()
    const nextNonce = await delayMod.queueNonce()

    // check if any pending txs
    if (currentNonce !== nextNonce) {
      // check if tx is expired
      const length = parseInt((nextNonce - currentNonce).toString())
      log(`${length} pending txs in delay module (${delayModAddress})`)
      const nonces = Array(length)
        .fill(0)
        .map((_, i) => BigInt(`${i}`) + currentNonce)
      const expired = await Promise.all(
        nonces.map((nonce) => isExpired(delayMod, nonce))
      )
      const expiredTxCount = expired.filter((x) => x).length
      if (expiredTxCount > 0) {
        log(
          `${expiredTxCount} expired txs in delay module (${delayModAddress})`
        )
      }
    }
  }
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
