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
const v0 = require('@unlock-protocol/unlock-abi-0')
const v1 = require('@unlock-protocol/unlock-abi-1')
const v2 = require('@unlock-protocol/unlock-abi-2')
const v3 = require('@unlock-protocol/unlock-abi-3')
const v11 = require('@unlock-protocol/unlock-abi-4')
const v12 = require('@unlock-protocol/unlock-abi-5')
const v13 = require('@unlock-protocol/unlock-abi-6')
const v7 = require('@unlock-protocol/unlock-abi-7')
/* eslint-enable import/no-extraneous-dependencies */

const toCompress = {
  v0,
  v1,
  v2,
  v3,
  v11,
  v12,
  v13,
  v7,
}
const output = {}

function formatTypes(types) {
  return types
    .map(type => `${type.type}${type.name ? ` ${type.name}` : ''}`)
    .join(',')
}

function formatEventTypes(types) {
  return types
    .map(type => `${type.type}${type.indexed ? ' indexed' : ''} ${type.name}`)
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

Object.keys(toCompress).forEach(version => {
  const PublicLockAbi = toCompress[version].PublicLock.abi.filter(f =>
    ['function', 'event'].includes(f.type)
  )
  const UnlockAbi = toCompress[version].Unlock.abi.filter(f =>
    ['function', 'event'].includes(f.type)
  )
  output[version] = {
    PublicLock: PublicLockAbi.map(formatSignature).filter(f => f),
    Unlock: UnlockAbi.map(formatSignature).filter(f => f),
  }
})

function formatBytecode() {
  return `// This file is auto-generated by ../../../scripts/compressAbi.js
// do not modify directly!

const bytecode = {
${Object.keys(output).map(version => {
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
${Object.keys(output).map(version => {
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
${Object.keys(output).map(version => {
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
