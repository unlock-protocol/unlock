import networks from '../src'
import path from 'path'
import fs from 'fs-extra'
import {
  validateKeys,
  validateERC20,
  validateBytecode,
  checkSubgraphHealth,
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
  let errors: string[] = []

  const fileList = process.env.ALL_CHANGED_FILES
    ? process.env.ALL_CHANGED_FILES.split(' ')
    : []

  for (const filePath of fileList) {
    // check mandatory keys using ts
    const resolvedPath = path.resolve('..', '..', filePath)
    console.log(resolvedPath)
    const typeErrors = await validateTypes(resolvedPath)
    errors = [...errors, ...typeErrors]

    // import file
    const { default: network } = await import(resolvedPath)
    console.log(network)

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
        errors.push(`❌ Unlock bytecode does not match ${contractName}`)
      }
    } catch (error) {
      errors.push(`❌ Could not fetch Unlock bytecode`)
    }

    // TODO: make sure the contracts are verified on Etherscan.

    // check subgraph endpoint status
    if (network.subgraph?.endpoint) {
      // make test query
      const subgraphErrors = await checkSubgraphHealth(
        network.subgraph?.endpoint
      )
      errors = [...errors, ...subgraphErrors]
    }

    // validate tokens
    if (network.tokens) {
      for (const token of network.tokens) {
        const tokenErrors = await validateERC20(token)
        errors = [...errors, ...tokenErrors.errors, ...tokenErrors.warnings]
      }
    }

    // check other missing keys
    // const missingKeys = await validateKeys(path.resolve(filePath))
    // errors = [...errors, ...missingKeys]
  }

  return { errors }
}

run()
  .then(({ errors }) => {
    if (errors.length > 0) {
      console.error(`We have found the followig errors :\n`)
      errors.forEach((error) => console.error(error, '\n'))
      // Exit with error code so CI fails
      process.exit(1)
    }
    console.log('Everything looks fine.')
  })
  .catch((err) => {
    throw Error(err)
  })
