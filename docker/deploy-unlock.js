/* eslint-disable no-console */

const {
  deploy,
  getWeb3Provider,
  WalletService,
  Web3Service,
} = require('@unlock-protocol/unlock-js')
const Unlock = require('unlock-abi-0-2').Unlock
const net = require('net')
const ethers = require('ethers')

var fs = require('fs')

var testErc20Token = JSON.parse(
  fs.readFileSync('/standup/TestErc20Token.json', 'utf8')
)

/*
 * This script is meant to be used in dev environment to deploy a version of the Unlock smart
 * contract from the packaged version to the local ganache server.
 */

const host = process.env.HTTP_PROVIDER || '127.0.0.1'
const port = 8545

let provider = new ethers.providers.JsonRpcProvider(`http://${host}:${port}`, {
  chainId: 1984,
})

let deployedLockAddress
let pk = '0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
let recipientAddress = '0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'

const deployTestERC20Token = async provider => {
  let wallet = await provider.getSigner(0)

  let factory = new ethers.ContractFactory(
    testErc20Token.abi,
    testErc20Token.bytecode,
    wallet
  )

  let testERC20
  try {
    testERC20 = await factory.deploy({ gasLimit: 6000000 })
  } catch (e) {
    console.log(e)
  }

  await testERC20.deployed()
  return testERC20.address
}

const mintForAddress = async (contract, wallet, recipient) => {
  // let wallet2 = new ethers.Wallet(pk, provider)
  let wallet2 = new ethers.Wallet(
    '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229',
    provider
  )
  let contractWSigner = contract.connect(wallet2)
  let tx = await contractWSigner.mint(recipient, 500, { gasLimit: 6000000 })

  await tx.wait(2)
  return tx.hash
}

const approveContract = async (
  provider,
  contract,
  privateKey,
  contractAddress
) => {
  let purchaserWallet = new ethers.Wallet(privateKey, provider)
  let contractWPurchaser = contract.connect(purchaserWallet)
  let approvaltx = await contractWPurchaser.approve(contractAddress, 50)
  await approvaltx.wait(2)
  return approvaltx.hash
}

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
    return deploy(host, port, Unlock, newContractInstance => {
      // Once unlock has been deployed, we need to deploy a lock too!
      const wallet = new WalletService({
        unlockAddress: newContractInstance.options.address,
      })

      const web3 = new Web3Service({
        readOnlyProvider: `http://${host}:${port}`,
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
        await wallet.createLock(
          {
            expirationDuration: 60 * 5, // 1 minute!
            keyPrice: '0.01', // 0.01 Eth
            maxNumberOfKeys: -1, // Unlimited
          },
          account
        )

        let testERC20TokenAddress = await deployTestERC20Token(provider)

        let contract = new ethers.Contract(
          testERC20TokenAddress,
          testErc20Token.abi,
          provider
        )
        console.log(`Token Contract Address: ${testERC20TokenAddress}`)

        await new Promise(resolve => {
          setTimeout(resolve, 1000)
        })

        let tokenTransferHash = await mintForAddress(
          contract,
          wallet,
          recipientAddress
        )

        let approvalTransaction = await approveContract(
          provider,
          contract,
          pk,
          testERC20TokenAddress
        )

        console.log(`Token Transfer Hash: ${tokenTransferHash}`)
        console.log(`Contract Approval Transaction: ${approvalTransaction}`)
      })

      wallet.on('network.changed', () => {
        wallet.getAccount()
      })
      wallet.connect(`http://${host}:${port}`)
    })
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
