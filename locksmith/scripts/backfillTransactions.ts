/**
 *  A onetime script adding chain ids to previousl stored transactions.
 *  This script should not be run again, and is being committed for historical reasons.
 *
 *  Executed locally using ts-node
 *
 *  Date: April 19, 2019
 */

const ethers = require('ethers')
const models = require('../src/models')

const { Transaction } = models

let provider = ethers.getDefaultProvider(4)

async function main() {
  let transactions = await Transaction.findAll()

  for (let i = 0; i < transactions.length; i++) {
    let currentTransaction = transactions[i]
    if (
      (await provider.getTransaction(currentTransaction.transactionHash)) ==
      null
    ) {
      await Transaction.update(
        { chain: 1 },
        { where: { transactionHash: currentTransaction.transactionHash } }
      )
    } else {
      await Transaction.update(
        { chain: 4 },
        { where: { transactionHash: currentTransaction.transactionHash } }
      )
    }
  }
}

main()
