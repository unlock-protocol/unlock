import { expect } from 'chai'
import { Contract } from 'ethers'
import { unlock, ethers } from 'hardhat'
import gql from 'graphql-tag'

import { lockParams } from './helpers/fixtures'
import { subgraph } from './helpers/subgraph'

const lockQuery = gql`
  query Lock($id: Bytes!) {
    lock(id: $id) {
      id
      tokenAddress
      address
      version
      price
      lockManagers
      createdAtBlock
    }
  }
`
const awaitTimeout = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay))

describe('Unlock', function () {
  describe('Create a simple lock', function () {
    let lock: Contract
    before(async () => {
      ;({ lock } = await unlock.createLock({ ...lockParams }))
    })
    it('deploy with the correct parameters', async () => {
      expect(await lock.keyPrice()).to.equals(lockParams.keyPrice)
      expect(await lock.tokenAddress()).to.equals(
        lockParams.currencyContractAddress
      )
      expect(await lock.expirationDuration()).to.equals(
        lockParams.expirationDuration
      )
      expect(await lock.maxNumberOfKeys()).to.equals(lockParams.maxNumberOfKeys)
      expect(await lock.name()).to.equals(lockParams.name)
    })
    it('subgraph store info correctly', async () => {
      // wait 2 sec for subgraph to index
      await awaitTimeout(2000)
      const [signer] = await ethers.getSigners()

      const lockAddress = lock.address.toLowerCase()

      const {
        data: { lock: lockInGraph },
      } = await subgraph.query({
        query: lockQuery,
        variables: {
          id: lockAddress,
        },
      })

      expect(lockInGraph.id).to.equals(lockAddress)
      expect(lockInGraph.address).to.equals(lockAddress)
      expect(lockInGraph.price).to.equals(lockParams.keyPrice.toString())
      expect(lockInGraph.tokenAddress).to.equals(
        lockParams.currencyContractAddress
      )
      expect(lockInGraph.lockManagers).to.deep.equals([signer.address])
      console.log(lockInGraph.version, await lock.publicLockVersion())
      expect(parseInt(lockInGraph.version)).to.equals(
        await lock.publicLockVersion()
      )

      // to be implemented in the graph yet...
      // expect(lockInGraph.expirationDuration).to.equals(
      //   lockParams.expirationDuration
      // )
      // expect(lockInGraph.name).to.equals(lockParams.name)
      // expect(lockInGraph.maxNumberOfKeys).to.equals(lockParams.maxNumberOfKeys)
    })
  })
})

describe.skip('Upgrade a lock', function () {
  let lock: Contract
  before(async () => {
    ;({ lock } = await unlock.createLock({ ...lockParams }))
  })
})
