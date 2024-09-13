import path from 'path'
import { ZeroAddress } from 'ethers'
import {
  wait,
  isVerified,
  checkMultisig,
  checkOwnership,
  checkProxyAdminOwnership,
  validateTypes,
  validateERC20,
  validateContractSource,
  checkSubgraphHealth,
  getAllAddresses,
} from './utils'

const run = async () => {
  const results = {}

  const fileList = process.env.ALL_CHANGED_FILES
    ? process.env.ALL_CHANGED_FILES.split(' ').filter(
        (f) => !f.includes(`networks/index.ts`)
      )
    : []

  for (const filePath of fileList) {
    let errors: string[] = []
    const successes: string[] = []
    const warnings: string[] = []
    const failures: string[] = []

    // check mandatory keys using ts
    const resolvedPath = path.resolve('..', '..', filePath)
    const typeErrors = await validateTypes(resolvedPath)
    errors = [...errors, ...typeErrors]
    if (!errors.length) {
      successes.push(`✅ all mandatory keys are present`)
    }

    // import file
    const { default: network } = await import(resolvedPath)

    // get all addresses to check
    const addresses = await getAllAddresses({ network })

    // make sure the contracts are verified on Etherscan.
    for (const contractName in addresses) {
      const contractAddress = addresses[contractName]
      if (!contractAddress || contractAddress === ZeroAddress) {
        warnings.push(`⚠️ Contract ${contractName} is missing`)
      }
      await wait(100)
      try {
        const verified = await isVerified({
          chainId: network.id,
          contractAddress,
        })
        // log results
        if (!verified?.isVerified) {
          errors.push(
            `❌ Contract ${contractName} at ${contractAddress} is not verified`
          )
        } else {
          successes.push(
            `✅ Contract ${contractName} at ${contractAddress} is verified`
          )
        }
      } catch (error) {
        failures.push(
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
        isProxy: true,
        providerURL: network.provider,
      })
      if (!isUnlockValid) {
        errors.push(
          `❌ Unlock source code at ${network.unlockAddress} does not match packaged UnlockV13`
        )
      } else {
        successes.push(
          `✅ Unlock source code at ${network.unlockAddress} matches packaged UnlockV13`
        )
      }
    } catch (error) {
      failures.push(
        `❌ Could not fetch Unlock source code from block explorer, ${error.messageText}`
      )
    }

    // check that template source code is indetical
    try {
      const publicLockAddress = addresses['PublicLockLatest']
      const isPublicLockValid = await validateContractSource({
        chainId: network.id,
        contractAddress: publicLockAddress,
        contractName: 'PublicLock',
        // TODO: fetch version automatically
        contractVersion: 14,
        providerURL: network.provider,
      })
      if (!isPublicLockValid) {
        errors.push(
          `❌ PublicLock source code at ${publicLockAddress} does not match packaged PublicLockV14`
        )
      } else {
        successes.push(
          `✅ PublicLock source code at ${publicLockAddress} matches packaged PublicLockV14`
        )
      }
    } catch (error) {
      failures.push(
        `❌ Could not fetch PublicLock source code from block explorer, ${error}`
      )
    }

    // check subgraph endpoint status
    if (network.subgraph?.endpoint) {
      // make test query
      const subgraphErrors = await checkSubgraphHealth(
        network.subgraph?.endpoint
      )
      errors = [...errors, ...subgraphErrors]
      if (!subgraphErrors.length) {
        successes.push(`✅ Subgraph up and running`)
      }
    }

    // validate tokens
    if (network.tokens) {
      for (const token of network.tokens) {
        const tokenErrors = await validateERC20({ network, token })
        errors = [
          ...errors,
          ...tokenErrors.errors,
          // ...tokenErrors.warnings,
        ]
      }
    }

    // multisig
    if (!network.multisig) {
      errors = [...errors, '❌ Multisig is missing.']
    } else {
      try {
        // check multisig params
        const multisigErrors = await checkMultisig({
          providerURL: network.provider,
          safeAddress: network.multisig,
        })
        if (!multisigErrors) {
          successes.push(`✅ Multisig set properly`)
        } else {
          errors = [...errors, ...multisigErrors]
        }

        // check contracts ownership
        const unlockOwner = await checkOwnership({
          contractAddress: network.unlockAddress,
          expectedOwner: network.multisig,
          providerURL: network.provider,
        })
        if (!unlockOwner) {
          errors.push(`❌ Unlock owner is not set to the multisig`)
        }
        const unlockProxyAdminOwner = await checkProxyAdminOwnership({
          contractAddress: network.unlockAddress,
          expectedOwner: network.multisig,
          providerURL: network.provider,
        })
        if (!unlockProxyAdminOwner) {
          errors.push(`❌ Unlock Proxy Admin owner is not set to the multisig`)
        }

        if (unlockOwner && unlockProxyAdminOwner) {
          successes.push(`✅ Unlock ownership correctly set to the multisig`)
        }

        // TODO: check upgradeable hooks ownership
      } catch (error) {
        failures.push(`❌ Could not fetch multisig / ownership info, ${error}`)
      }
    }

    // TODO: check other missing keys
    // const missingKeys = await validateKeys(path.resolve(filePath))
    // warnings = [...errors, ...missingKeys]

    // store network prefix
    const networkName = `${filePath}`
    results[networkName] = {
      errors,
      failures,
      successes,
      warnings,
    }
  }

  return { results }
}

const parseGithubComment = ({
  networkName,
  errors,
  failures,
  successes,
  warnings,
}) => `### ${networkName}

${successes.length ? `The setup is successful :\n` : ''}
${successes.map((success) => `- ${success}`).join('\n')}

${errors.length ? `We have found the following errors :\n` : ''}
${errors.map((error) => `- ${error}`).join('\n')}

${failures.length ? `Some verification calls have failed  :\n` : ''}
${failures.map((failure) => `- ${failure}`).join('\n')}

${warnings.length ? `Some additonal warnings  :\n` : ''}
${warnings.map((warning) => `- ${warning}`).join('\n')}
`

run()
  .then(({ results }) => {
    if (Object.keys(results).length > 0) {
      Object.keys(results).forEach((networkName) =>
        console.log(
          parseGithubComment({ networkName, ...results[networkName] })
        )
      )
      const errored = Object.keys(results)
        .map((networkName) => results[networkName].errors.length)
        .some((d) => d > 0)

      // Exit with error code in case so CI fails
      process.exit(errored ? 1 : 0)
    }
    console.log('Everything looks fine.')
  })
  .catch((err) => {
    console.log(err)
    console.log(`Could not process the file: ${err.message}`)
    process.exit(1)
  })
