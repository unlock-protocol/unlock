const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const multisigOldABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')

// get the correct provider if chainId is specified
const getProvider = async (chainId) => {
  let provider
  if (chainId) {
    const { publicProvider } = networks[chainId]
    provider = new ethers.JsonRpcProvider(publicProvider)
  } else {
    ;({ provider } = ethers)
    ;({ chainId } = await getNetwork())
  }
  return { provider, chainId }
}

// custom services URL for network not supported by Safe
const safeServiceURLs = {
  42220: 'http://mainnet-tx-svc.celo-safe-prod.celo-networks-dev.org/',
  // mumbai isnt supported by Safe Global, you need to run Safe infrastructure locally
  80001: 'http://localhost:8000/cgw/',
  // for some reasons, zkevm throws in lib
  1101: 'https://safe-transaction-zkevm.safe.global',
}

// get safeAddress directly from unlock if needed
const getSafeAddress = async (chainId) => {
  const { multisig } = networks[chainId]
  return multisig
}

const getSafeVersion = async (safeAddress) => {
  const abi = [
    {
      inputs: [],
      name: 'VERSION',
      outputs: [
        {
          internalType: 'string',
          name: '',
          type: 'string',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
  ]
  const safe = await ethers.getContractAt(abi, safeAddress)
  try {
    const version = await safe.VERSION()
    return version
  } catch (error) {
    return 'old'
  }
}

// mainnet still uses older versions of the safe
const submitTxOldMultisig = async ({ safeAddress, tx, signer }) => {
  // encode contract call
  const {
    contractNameOrAbi,
    contractAddress,
    functionName,
    functionArgs,
    calldata,
    value, // in ETH
  } = tx

  let encodedFunctionCall
  if (!calldata) {
    const { interface } = await ethers.getContractFactory(contractNameOrAbi)
    encodedFunctionCall = interface.encodeFunctionData(
      functionName,
      functionArgs
    )
  } else {
    encodedFunctionCall = calldata
  }

  console.log(
    `Submitting ${functionName} to multisig ${safeAddress} (v: old)...`
  )

  const safe = new ethers.Contract(safeAddress, multisigOldABI, signer)
  const txSubmitted = await safe.submitTransaction(
    contractAddress,
    value || 0, // ETH value
    encodedFunctionCall
  )

  // submit to multisig
  const receipt = await txSubmitted.wait()
  const { transactionHash, events } = receipt
  const nonce = events
    .find(({ event }) => event === 'Submission')
    .args.transactionId.toNumber()
  console.log(
    `Tx submitted to multisig with id '${nonce}' (txid: ${transactionHash})`
  )
  return nonce
}

module.exports = {
  getProvider,
  getSafeAddress,
  getSafeVersion,
  submitTxOldMultisig,
  safeServiceURLs,
}
