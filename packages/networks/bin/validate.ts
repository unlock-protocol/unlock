import path from 'path'
import {
  wait,
  isVerified,
  validateKeys,
  validateTypes,
  validateERC20,
  validateContractSource,
  getCreationTx,
  checkSubgraphHealth,
  getAllAddresses,
} from './utils'

const run = async () => {
  const errors = {}

  const fileList = process.env.ALL_CHANGED_FILES
    ? process.env.ALL_CHANGED_FILES.split(' ')
    : []

  for (const filePath of fileList) {
    let networkErrors: string[] = []
    // check mandatory keys using ts
    const resolvedPath = path.resolve('..', '..', filePath)
    const typeErrors = await validateTypes(resolvedPath)
    networkErrors = [...networkErrors, ...typeErrors]

    // import file
    const { default: network } = await import(resolvedPath)

    // get all addresses to check
    const addresses = await getAllAddresses({ network })

    // make sure the contracts are verified on Etherscan.
    for (const contractName in addresses) {
      const contractAddress = addresses[contractName]
      await wait(100)
      try {
        const verified = await isVerified({
          chainId: network.id,
          contractAddress,
        })
        // log results
        if (!verified?.isVerified) {
          networkErrors.push(
            `❌ Contract ${contractName} at ${contractAddress} is not verified`
          )
        }
      } catch (error) {
        networkErrors.push(
          `❌ Failed to check verification for contract ${contractName} at ${contractAddress}
    (did you add block explorer verification and API in \`@unlock-protocol/hardhat-helpers\` package ?)`
        )
      }
    }

    // check that Unlock contract code is identical
    try {
      const isUnlockValid = await validateContractSource({
        chainId: network.id,
        contractAddress: network.unlockAddress,
        contractName: 'Unlock',
        // TODO: fetch version automatically
        contractVersion: 13,
        providerURL: network.provider,
      })
      if (!isUnlockValid) {
        networkErrors.push(
          `❌ Unlock source code at ${network.unlockAddress} does not match packaged UnlockV13`
        )
      }
    } catch (error) {
      console.log(error)
      networkErrors.push(
        `❌ Could not fetch Unlock bytecode, ${error.messageText}`
      )
    }

    // check that template source code is indetical
    try {
      const publicLockAddress = addresses['PublicLockLatest']
      const isUnlockValid = await validateContractSource({
        chainId: network.id,
        contractAddress: publicLockAddress,
        contractName: 'PublicLock',
        // TODO: fetch version automatically
        contractVersion: 14,
        providerURL: network.provider,
      })
      if (!isUnlockValid) {
        networkErrors.push(
          `❌ PublicLock source code at ${publicLockAddress} does not match packaged PublicLockV13`
        )
      }
    } catch (error) {
      console.log(error)
      networkErrors.push(
        `❌ Could not fetch PublicLock source code , ${error.messageText}`
      )
    }

    // check subgraph endpoint status
    if (network.subgraph?.endpoint) {
      // make test query
      const subgraphErrors = await checkSubgraphHealth(
        network.subgraph?.endpoint
      )
      networkErrors = [...networkErrors, ...subgraphErrors]
    }

    // validate tokens
    if (network.tokens) {
      for (const token of network.tokens) {
        const tokenErrors = await validateERC20({ network, token })
        networkErrors = [
          ...networkErrors,
          ...tokenErrors.errors,
          // ...tokenErrors.warnings,
        ]
      }
    }

    // TODO: check other missing keys
    // const missingKeys = await validateKeys(path.resolve(filePath))
    // warnings = [...errors, ...missingKeys]

    // store network prefix
    const networkName = `${filePath}`
    errors[networkName] = networkErrors
  }

  return { errors }
}

const parseGithubComment = (errors) => {
  console.error(`We have found the followig errors :\n`)
  Object.keys(errors).forEach((networkName) =>
    console.error(
      `
### ${networkName}

${errors[networkName].map((error) => `- ${error}`).join('\n')}`
    )
  )
}

run()
  .then(({ errors }) => {
    if (Object.keys(errors).length > 0) {
      parseGithubComment(errors)
      // Exit with error code so CI fails
      process.exit(1)
    }
    console.log('Everything looks fine.')
  })
  .catch((err) => {
    console.log(err)
    console.error(`Could not process the file: ${err.message}`)
    process.exit(1)
  })
