/* eslint-disable no-console */
const {
  deploy,
  WalletService,
  Web3Service,
} = require('@unlock-protocol/unlock-js')
const net = require('net')
const ethers = require('ethers')
const TokenDeployer = require('./deploy-locks')

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */
const host = process.env.HTTP_PROVIDER_HOST
const port = process.env.HTTP_PROVIDER_PORT
let deployedLockAddress
let purchaser = process.env.PURCHASER_ADDRESS
let recipientAddress = process.env.ERC20_TOKEN_RECIPIENT
let bootstrapTransferAmount = process.env.BOOTSTRAP_AMOUNT
let bootstrapTranferRecipient = process.env.ETHEREUM_ADDRESS
let contractOwnerAddress = process.env.CONTRACT_OWNER_ADDRESS

let providerURL = `http://${host}:${port}`
let provider = new ethers.providers.JsonRpcProvider(providerURL, {
  chainId: 1984,
})

const serverIsUp = (delay, maxAttempts) =>
  new Promise((resolve, reject) => {
    let attempts = 1
    const tryConnecting = () => {
      const socket = net.connect(port, host, () => {
        resolve()
        return socket.end() // clean-up
      })

      socket.on('error', error => {
        if (error.code === 'ECONNREFUSED') {
          if (attempts < maxAttempts) {
            attempts += 1
            return setTimeout(tryConnecting, delay)
          }
          return reject(error)
        }
        return reject(error)
      })
    }
    tryConnecting()
  })

serverIsUp(1000 /* every second */, 120 /* up to 2 minutes */)
  .then(() => {
    return deploy(host, port, 'v02', newContractInstance => {
      // Once unlock has been deployed, we need to deploy a lock too!
      const wallet = new WalletService({
        unlockAddress: newContractInstance.options.address,
      })

      const web3 = new Web3Service({
        readOnlyProvider: providerURL,
        unlockAddress: newContractInstance.options.address,
      })

      console.log(
        `the unlock deployment ${newContractInstance.options.address}`
      )

      // // This will be called multiple times, for each confirmation
      web3.on('lock.updated', address => {
        if (!deployedLockAddress) {
          deployedLockAddress = address
          console.log(`Lock deployed at ${address}`)
        }
      })

      wallet.on('lock.updated', (_, { transaction }) => {
        web3.getTransaction(transaction)
      })

      wallet.on('account.changed', async account => {
        TokenDeployer.prepareEnvironment(
          wallet,
          contractOwnerAddress,
          account,
          provider,
          purchaser,
          recipientAddress
        )

        let eWallet = provider.getSigner(contractOwnerAddress)

        await new Promise(resolve => {
          setTimeout(resolve, 5000)
        })

        await eWallet.sendTransaction({
          to: bootstrapTranferRecipient,
          value: ethers.utils.parseEther(bootstrapTransferAmount.toString()),
        })
      })

      wallet.on('network.changed', () => {
        wallet.getAccount()
      })
      wallet.connect(providerURL)
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
