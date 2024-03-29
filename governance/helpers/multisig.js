const { ethers } = require('hardhat')
const { networks } = require('@unlock-protocol/networks')
const { getNetwork } = require('@unlock-protocol/hardhat-helpers')
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig2.json')
const multisigOldABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig.json')
const SafeApiKit = require('@safe-global/api-kit').default

// custom services URL for network not supported by Safe
const safeServiceURLs = {
  324: 'https://safe-transaction-zksync.safe.global/api',
  1101: 'https://safe-transaction-zkevm.safe.global/api',
  534352: 'https://transaction.safe.scroll.xyz/api',
  59144: 'https://transaction.safe.linea.build/api',
}

const prodSigners = [
  '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f', // cc
  '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a', // jg
  '0x4011d09a86D0acA8377a4A8baD691F1ACeeCd672', // nf
  '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212', // aa
  '0xccb5D94FbfBFDc4953Ca8a114f88773C2fF98e80', // sm
  '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // cr
  '0x2785f2a3DDaCfDE5947F1A9D6c878CCD7F885400', // cn
  '0x7A23608a8eBe71868013BDA0d900351A83bb4Dc2', // nm
  '0x8de33D8204929ceb2F7AA6299d0643a7f6664c9b', // bw
].sort()

const devSigners = [
  '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a', // jg
  '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // cr
  '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f', // cc
].sort()

const getExpectedSigners = async (chainId) => {
  const { isTestNetwork } = await getNetwork(chainId)
  const expectedSigners = isTestNetwork ? devSigners : prodSigners
  return expectedSigners
}

const logError = (name, chainId, multisig, msg) =>
  console.log(`[${name} (${chainId})]: ${multisig} ${msg}`)

const getSafeService = async (chainId) => {
  const txServiceUrl = safeServiceURLs[chainId] || null
  console.log(`Using Safe Global service at ${txServiceUrl} - chain ${chainId}`)

  const safeService = new SafeApiKit({
    chainId,
    txServiceUrl,
  })

  return safeService
}

const getMultiSigInfo = async (chainId, multisig) => {
  const errors = []
  const { isTestNetwork } = networks[chainId]
  const expectedSigners = isTestNetwork ? devSigners : prodSigners
  const provider = await getProvider(chainId)
  const safeService = await getSafeService(chainId)

  const { count } = await safeService.getPendingTransactions(multisig)
  if (count) {
    errors.push(`${count} pending txs are waiting to be signed`)
  }
  // the flags to get only un-executed transactions does not work
  // filed here https://github.com/safe-global/safe-core-sdk/issues/690
  // const allTxs = await safeService.getAllTransactions(multisig, {
  //   executed: false,
  //   trusted: false,
  //   queued: false,
  // })

  if (!multisig) {
    errors.push('Missing multisig')
  } else {
    const safe = new ethers.Contract(multisig, multisigABI, provider)
    const owners = await safe.getOwners()
    const policy = await safe.getThreshold()

    if (isTestNetwork && policy < 2) {
      errors.push('❌ Policy below 2!')
    }
    if (!isTestNetwork && policy < 4) {
      errors.push(
        `❌ Unexpected policy: ${policy}/${owners.length} for 4/${expectedSigners.length} expected`
      )
    }

    let extraSigners = owners.filter((x) => !expectedSigners.includes(x))
    if (extraSigners.length > 0) {
      errors.push(`❌ Extra signers: ${[...extraSigners].sort()}`)
    }

    let missingSigners = expectedSigners.filter((x) => !owners.includes(x))
    if (missingSigners.length > 0) {
      errors.push(`❌ Missing signers: ${missingSigners}`)
    }
  }
  return errors
}

// get the correct provider if chainId is specified
const getProvider = async (chainId) => {
  let provider
  if (chainId) {
    const { provider: publicProvider } = networks[chainId]
    provider = new ethers.JsonRpcProvider(publicProvider)
  } else {
    ;({ provider } = ethers)
    ;({ chainId } = await getNetwork())
  }
  return { provider, chainId }
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
  prodSigners,
  devSigners,
  getMultiSigInfo,
  getExpectedSigners,
  logError,
  getSafeService,
}
