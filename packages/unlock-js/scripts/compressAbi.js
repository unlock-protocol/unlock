/* eslint-disable no-console */
/**
 * This file generates the files src/abis.js, src/__tests__/helpers/bytecode.js and src/deployableBytecode.js
 * by extracting them from the packages below.
 *
 * On contract release, require the contract and update "toCompress" below
 */

const ethers = require('ethers')
const fs = require('fs')
const path = require('path')

/* eslint-disable import/no-extraneous-dependencies */
const abis = require('@unlock-protocol/contracts')

const toCompress = {}

const versions = ['v4', 'v6', 'v7', 'v8', 'v9']

versions.forEach((v) => {
  toCompress[v] = {
    Unlock: abis[`Unlock${v.toUpperCase()}`],
    PublicLock: abis[`PublicLock${v.toUpperCase()}`],
  }
})

const output = {}

function formatTypes(types) {
  return types
    .map((type) => `${type.type}${type.name ? ` ${type.name}` : ''}`)
    .join(',')
}

function formatEventTypes(types) {
  return types
    .map((type) => `${type.type}${type.indexed ? ' indexed' : ''} ${type.name}`)
    .join(',')
}

function formatSignature(sig) {
  if (sig.type === 'event') {
    if (sig.anonymous) return false // can't filter on anonymous events so ignore them
    return `event ${sig.name} (${formatEventTypes(sig.inputs)})`
  }
  let ret = `function ${sig.name}(${formatTypes(sig.inputs)})`
  if (sig.constant) ret += ' constant'
  if (sig.stateMutability !== 'nonpayable') ret += ` ${sig.stateMutability}`
  if (sig.outputs.length) {
    ret += ` returns (${formatTypes(sig.outputs)})`
  }
  return ret
}

Object.keys(toCompress).forEach((version) => {
  const PublicLockAbi = toCompress[version].PublicLock.abi.filter((f) =>
    ['function', 'event'].includes(f.type)
  )
  const UnlockAbi = toCompress[version].Unlock.abi.filter((f) =>
    ['function', 'event'].includes(f.type)
  )
  output[version] = {
    PublicLock: PublicLockAbi.map(formatSignature).filter((f) => f),
    Unlock: UnlockAbi.map(formatSignature).filter((f) => f),
  }
})

function formatBytecode() {
  return `// This file is auto-generated by ../../../scripts/compressAbi.js
// do not modify directly!

const bytecode = {
${Object.keys(output).map((version) => {
  return `  ${version}: {
    PublicLock:
      '${toCompress[version].PublicLock.deployedBytecode}',
    Unlock:
      '${toCompress[version].Unlock.deployedBytecode}',
  }`
}).join(`,
`)},
}

export default bytecode
`
}

// this is used to generate the bytecode for Unlock contracts that is used in deploy.js
function formatDeployableBytecode() {
  return `// This file is auto-generated by ../scripts/compressAbi.js
// do not modify directly!

const bytecode = {
${Object.keys(output).map((version) => {
  return `  ${version}: {
    PublicLock:
      '${toCompress[version].PublicLock.bytecode}',
    Unlock:
      '${toCompress[version].Unlock.bytecode}',
  }`
}).join(`,
`)},
}

export default bytecode
`
}

function formatSource() {
  return `// This file is auto-generated by ../scripts/compressAbi.js
// do not modify directly!

const abis = {
${Object.keys(output).map((version) => {
  return `  ${version}: {
    PublicLock: {
      contractName: 'PublicLock',
      abi: [
        '${output[version].PublicLock.join(`',
        '`)}',
      ],
      bytecodeHash:
        '${ethers.utils.sha256(
          toCompress[version].PublicLock.deployedBytecode
        )}',
    },
    Unlock: {
      contractName: 'Unlock',
      abi: [
        '${output[version].Unlock.join(`',
        '`)}',
      ],
      bytecodeHash:
        '${ethers.utils.sha256(toCompress[version].Unlock.deployedBytecode)}',
    },
  },`
}).join(`
`)}
}

export default abis
`
}

console.log('writing bytecode...')
fs.writeFileSync(
  `${path.dirname(__dirname)}/src/__tests__/helpers/bytecode.js`,
  formatBytecode()
)
console.log('writing deployable bytecode...')
fs.writeFileSync(
  `${path.dirname(__dirname)}/src/bytecode.js`,
  formatDeployableBytecode()
)
console.log('writing abis...')
fs.writeFileSync(`${path.dirname(__dirname)}/src/abis.js`, formatSource())
console.log('done')
