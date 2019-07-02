/* eslint-disable no-console */
var fs = require('fs')
const ethers = require('ethers')

var testErc20Token = JSON.parse(
  fs.readFileSync(__dirname + '/TestErc20Token.json', 'utf8')
)

const ERC20_MINT_AMOUNT = '500'

/**
 * This function transfers 10 Eth to the recipient from the first Unlocked account on the node
 * Note: by default the account on the node have 100 Eth. So this will fail if there are more
 * than 10 recipient.
 * @param {*} provider
 * @param {*} recipients
 */
async function transferEth(provider, recipients) {
  let wallet = await provider.getSigner(0)
  const bootstrapTransferAmount = '10.0'

  await recipients.map(async recipient => {
    console.log(`TRANSFER OF ${bootstrapTransferAmount} ETH TO ${recipient}`)
    await wallet.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther(bootstrapTransferAmount),
    })
  })
}

/**
 * This function deploys an ERC20 token contract
 * And assigns ERC20_MINT_AMOUNT ERC20 to the recipient
 * @param {*} provider
 * @param {*} recipient
 */
async function setUpERC20Token(provider, recipients) {
  let wallet = await provider.getSigner(0)

  let factory = new ethers.ContractFactory(
    testErc20Token.abi,
    testErc20Token.bytecode,
    wallet
  )

  let testERC20 = await factory.deploy({ gasLimit: 6000000 })
  await testERC20.deployed()

  // Once deployed, let's mint some for the recipients
  // This is required because the ERC20 Locks check the supply
  await recipients.map(async recipient => {
    console.log(`MINTING ${ERC20_MINT_AMOUNT} FOR ${recipient}`)
    await testERC20.mint(
      recipient,
      ethers.utils.parseUnits(ERC20_MINT_AMOUNT, 18),
      {
        gasLimit: 6000000,
      }
    )
  })

  return testERC20
}

/**
 * The function deploys a lock and yields the transaction object once the lock has been deployed
 * @param {*} web3Service
 * @param {*} wallet
 * @param {*} account
 * @param {*} lock
 */
async function deployLock(web3Service, wallet, account, lock) {
  let transaction = {}
  let promise = new Promise(resolve => {
    wallet.once('transaction.new', hash => {
      transaction.hash = hash
      web3Service.on('transaction.updated', (transactionHash, update) => {
        if (hash === transactionHash) {
          transaction = { ...transaction, ...update }
          if (transaction.confirmations == web3Service.requiredConfirmations) {
            resolve(transaction)
          }
        }
      })

      web3Service.getTransaction(hash)
    })
  })

  await wallet.createLock(lock, account)
  return promise
}

/**
 * Deploys the Ether lock used for testing locksmith
 * @param {*} web3Service
 * @param {*} wallet
 * @param {*} account
 */
async function deployETHLock(web3Service, wallet, account) {
  return deployLock(web3Service, wallet, account, {
    expirationDuration: 60 * 5, // 1 minute!
    keyPrice: '0.01', // 0.01 Eth
    maxNumberOfKeys: -1, // Unlimited
    currencyContractAddress: null,
    name: 'Ether Lock',
  })
}

/**
 * Deploys the ERC20 lock used for testing locksmith
 * @param {*} web3Service
 * @param {*} wallet
 * @param {*} account
 * @param {*} contractAddress
 */
async function deployERC20Lock(web3Service, wallet, account, contractAddress) {
  return deployLock(web3Service, wallet, account, {
    expirationDuration: 60 * 5, // 1 minute!
    keyPrice: '1', // 1 ERC20
    maxNumberOfKeys: -1, // Unlimited
    currencyContractAddress: contractAddress,
    name: 'ERC20 Lock',
  })
}

/**
 * The function adds an allowance to the lock so that it can withdraw ERC20 tokens
 * from the purchaseAddress
 * @param {*} provider
 * @param {*} purchaserAddress
 * @param {*} erc20ContractAddress
 * @param {*} lockAddress
 */
async function approveContract(
  provider,
  purchaserAddress,
  erc20ContractAddress,
  lockAddress
) {
  let contract = new ethers.Contract(
    erc20ContractAddress,
    testErc20Token.abi,
    provider
  )

  let purchaserWallet = provider.getSigner(purchaserAddress)
  let contractWPurchaser = contract.connect(purchaserWallet)
  let approvaltx = await contractWPurchaser.approve(
    lockAddress,
    ethers.utils.parseUnits(ERC20_MINT_AMOUNT, 18)
  )
  await approvaltx.wait(2)
  console.log(
    `APPROVED ${lockAddress} TO WITHDRAW UP TO ${ERC20_MINT_AMOUNT} FROM ${purchaserAddress}`
  )
  return approvaltx.hash
}

/**
 * This function prepares the environment by:
 * 0. Transfers some Eth to
 *  a. recipientAddress (a regular Ethereum user)
 *  b. purchaserAddress (the locksmith user which purchases keys on behalf of users, to pay for gas)
 * 1. Deploying an ERC20 lock and assigning some ERC20 to the following
 *  a. recipientAddress (a regular Ethereum user)
 *  b. purchaserAddress (the locksmith user which purchases keys on behalf of users)
 * 2. Deploys an Ether Lock (it will be owned by the first unlocked user on the node)
 * 3. Deploys an ERC20 Lock (it will be owned by the first unlocked user on the node)
 * 4. Approves the ERC20 Lock to withdraw from the locksmith users' balance on the ERC20 contract
 * @param {*} web3Service
 * @param {*} wallet
 * @param {*} account
 * @param {*} provider
 * @param {*} purchaserAddress
 * @param {*} recipientAddress
 */
async function prepareEnvironment(
  web3Service,
  wallet,
  account,
  provider,
  purchaserAddress,
  recipientAddress
) {
  await transferEth(provider, [recipientAddress, purchaserAddress])

  let testERC20Token = await setUpERC20Token(provider, [
    recipientAddress,
    purchaserAddress,
  ])
  console.log(`ERC20 CONTRACT DEPLOYED AT ${testERC20Token.address}`)

  const ethLockTransaction = await deployETHLock(web3Service, wallet, account)

  console.log(`ETH LOCK DEPLOYED AT ${ethLockTransaction.lock}`)

  const erc20LockTransaction = await deployERC20Lock(
    web3Service,
    wallet,
    account,
    testERC20Token.address
  )

  console.log(`ERC20 LOCK DEPLOYED AT ${erc20LockTransaction.lock}`)

  await approveContract(
    provider,
    purchaserAddress,
    testERC20Token.address,
    erc20LockTransaction.lock
  )
}

module.exports = {
  prepareEnvironment,
}
