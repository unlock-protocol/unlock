import path from 'path'
import {
  wait,
  isVerified,
  validateKeys,
  validateERC20,
  validateBytecode,
  checkSubgraphHealth,
  getAllAddresses,
} from './utils'
import * as ts from 'typescript'
import tsconfig from '../tsconfig.json'

// validate ts types
const validateTypes = async (filePath) => {
  let errors: string[] = []
  const program = ts.createProgram([filePath], tsconfig.compilerOptions)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  for (const diagnostic of diagnostics) {
    if (diagnostic.file?.fileName === filePath) {
      const message = diagnostic.messageText
      errors = [
        ...errors,
        `❌ Syntax Error: (${diagnostic.file?.fileName}) ${message}`,
      ]
    }
  }
  return errors
}

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

    // TODO: validate template bytecode
    // validate Unlock bytecode
    const contractName = 'UnlockV13'
    try {
      const isUnlockValid = await validateBytecode({
        contractAddress: network.unlockAddress,
        contractName,
        providerURL: network.provider,
      })
      if (!isUnlockValid) {
        networkErrors.push(
          `❌ Unlock bytecode at ${network.unlockAddress} does not match ${contractName}`
        )
      }
    } catch (error) {
      networkErrors.push(
        `❌ Could not fetch Unlock bytecode, ${error.messageText}`
      )
    }

    // make sure the contracts are verified on Etherscan.
    const addresses = await getAllAddresses({ network })

    // api calls
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

run()
  .then(({ errors }) => {
    if (Object.keys(errors).length > 0) {
      console.error(`We have found the followig errors :\n`)
      Object.keys(errors).forEach((networkName) =>
        console.error(
          `
### ${networkName}

${errors[networkName].map((error) => `- ${error}`).join('\n')}`
        )
      )
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
