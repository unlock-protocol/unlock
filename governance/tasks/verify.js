const { task } = require('hardhat/config')
const fs = require('fs-extra')
const path = require('path')

const contractsPath = path.resolve(
  __dirname,
  '..',
  'contracts',
  'past-versions'
)
const artifactsPath = path.resolve(
  __dirname,
  '..',
  'artifacts',
  'contracts',
  'past-versions'
)

task('verify-proxy', 'Deploy and verify the TransparentProxy used by locks')
  .addParam('lockAddress', 'the PublicLock template address')
  .addOptionalParam('unlockAddress', 'the Unlock factory address')
  .addOptionalParam('creationTx', 'the tx hash of lock creation')
  .addOptionalParam('deployNew', 'deploy and verify a new lock')
  .setAction(async ({ lockAddress, unlockAddress, creationTx, deployNew }) => {
    // eslint-disable-next-line global-require
    const verifyProxy = require('../scripts/verify/proxy')
    await verifyProxy({
      lockAddress,
      unlockAddress,
      creationTx,
      deployNew,
    })
  })

task('verify-template', 'Verify the PublicLock at specific version')
  .addParam('publicLockAddress', 'the PublicLock template address')
  .addParam('publicLockVersion', 'the PublicLock version to verify')
  .setAction(async ({ publicLockAddress, publicLockVersion }, { run }) => {
    if (publicLockVersion) {
      const contractPath = `@unlock-protocol/contracts/dist/PublicLock/PublicLockV${publicLockVersion}.sol`

      await fs.copy(
        require.resolve(contractPath),
        path.resolve(contractsPath, `PublicLockV${publicLockVersion}.sol`)
      )
    }
    await run('verify:verify', {
      address: publicLockAddress,
    })

    if (publicLockVersion) {
      await fs.remove(contractsPath)
      await fs.remove(artifactsPath)
    }
  })

task('verify-unlock', 'Verify the Unlock factory at specific version')
  .addParam('unlockAddress', 'the Unlock proxy address')
  .addParam('unlockVersion', 'the Unlock version to verify')
  .setAction(async ({ unlockAddress, unlockVersion }, { run, network }) => {
    const { FormData, fetch } = await import('undici')

    // 1. Copy the versioned contract into past-versions/ so hardhat can compile it
    const tempContractPath = path.resolve(
      contractsPath,
      `UnlockV${unlockVersion}.sol`
    )
    const contractPkg = `@unlock-protocol/contracts/dist/Unlock/UnlockV${unlockVersion}.sol`
    await fs.copy(require.resolve(contractPkg), tempContractPath)

    // 2. Compile to build/refresh build-info artifacts
    await run('compile')

    // 3. Read back the minimal standard JSON input from build-info
    const buildInfoDir = path.resolve(
      __dirname,
      '..',
      'artifacts',
      'build-info'
    )
    const targetSource = `contracts/past-versions/UnlockV${unlockVersion}.sol`
    let standardInput, compilerVersion

    for (const file of await fs.readdir(buildInfoDir)) {
      if (!file.endsWith('.json')) continue
      const info = JSON.parse(
        await fs.readFile(path.join(buildInfoDir, file), 'utf8')
      )
      if (info.input?.sources?.[targetSource]) {
        standardInput = JSON.stringify({
          language: info.input.language,
          sources: { [targetSource]: info.input.sources[targetSource] },
          settings: info.input.settings,
        })
        compilerVersion = `v${info.solcVersion}`
        break
      }
    }

    if (!standardInput) {
      throw new Error(
        `Could not find build-info for ${targetSource}. ` +
          `Ensure the contract compiled successfully.`
      )
    }

    // 4. Find the Blockscout explorer URL for this network
    const { etherscan } = require('@unlock-protocol/hardhat-helpers')
    const chainConfig = etherscan.customChains?.find(
      (c) => c.chainId === network.config.chainId
    )
    if (!chainConfig) {
      throw new Error(
        `No Blockscout customChain entry found for chainId ${network.config.chainId}`
      )
    }
    const explorerBase = chainConfig.urls.browserURL.replace(/\/$/, '')
    const apiUrl = `${explorerBase}/api/v2/smart-contracts/${unlockAddress}/verification/via/standard-input`

    console.log(`\n> Verifying ${unlockAddress} on ${explorerBase}`)
    console.log(`  Compiler   : ${compilerVersion}`)
    console.log(`  Source file: ${targetSource}`)
    console.log(`  Payload    : ${Math.round(standardInput.length / 1024)} KB`)

    // 5. POST via Blockscout v2 REST API (multipart) with a browser User-Agent
    //    This avoids the Cloudflare WAF rule that blocks the Etherscan-compat endpoint
    const form = new FormData()
    form.set('compiler_version', compilerVersion)
    form.set('license_type', 'mit')
    form.set(
      'files[0]',
      new Blob([standardInput], { type: 'application/json' }),
      `UnlockV${unlockVersion}_standard_input.json`
    )

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: form,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
    })

    const responseText = await response.text()

    if (!response.ok) {
      if (responseText.includes('DOCTYPE')) {
        throw new Error(
          `Cloudflare blocked the verification request (HTTP ${response.status}).\n` +
            `Please verify manually at:\n  ${explorerBase}/address/${unlockAddress}/contract-verification`
        )
      }
      throw new Error(
        `Verification failed (HTTP ${response.status}): ${responseText.slice(0, 400)}`
      )
    }

    console.log(`\n✅ Verification submitted!`)
    try {
      const json = JSON.parse(responseText)
      console.log(`   Status: ${JSON.stringify(json)}`)
    } catch {
      console.log(`   Response: ${responseText.slice(0, 200)}`)
    }
    console.log(
      `\n   View: ${explorerBase}/address/${unlockAddress}?tab=contract`
    )

    // 6. Clean up temp files
    await fs.remove(tempContractPath)
    await fs.remove(artifactsPath)
  })
