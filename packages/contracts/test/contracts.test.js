/* eslint strict: 0, global-require: 0 */
const { run } = require('hardhat')
const { expect } = require('chai')
const fs = require('fs-extra')
const { listAllContracts } = require('./helpers')

const contractNames = ['Unlock', 'PublicLock']

const contracts = contractNames
  .map(c => 
    listAllContracts(c).filter(c => c[0] !== 'I') // remove interfaces
  )

describe('build', ()=> {
  it('all contracts can be built', async () => {
    await run('compile')
  })
})

// test for each contract
contracts.forEach((contractsPaths, i) =>{
  const contractName = contractNames[i]
  describe(`Contract ${contractName}`, () => {
    contractsPaths.forEach(contract => {
      describe(`Contract ${contract}`, () => {    
        
        it('has corresponding abi', async () => {
          const abiPath = `./src/abis/${contractName}/${contract.replace('.sol', '.json')}`
          expect(await fs.pathExists(abiPath)).to.be.true
        })
      })
    })
  })
})