import { ethers } from 'ethers'
import utils from './utils'

/**
 * This file is only needed with ethers v4. v5 will come with an UncheckedJsonSigner
 * that we can use.
 *
 * See https://github.com/ethers-io/ethers.js/issues/511
 */
export default class FastJsonRpcSigner extends ethers.Signer {
  constructor(signer) {
    super()
    ethers.utils.defineReadOnly(this, 'signer', signer)
    ethers.utils.defineReadOnly(this, 'provider', signer.provider)
  }

  getAddress() {
    return this.signer.getAddress()
  }

  async sendTransaction(transaction) {
    const hash = await this.signer.sendUncheckedTransaction(transaction)

    let gasLimit
    if (transaction.gasLimit) {
      gasLimit = utils.bigNumberify(
        utils.hexStripZeros(utils.hexlify(transaction.gasLimit))
      )
    }

    let gasPrice
    if (transaction.gasPrice) {
      gasPrice = utils.bigNumberify(
        utils.hexStripZeros(utils.hexlify(transaction.gasLimit))
      )
    }

    const ret = {
      ...transaction,
      hash: hash,
      blockHash: null,
      blockNumber: null,
      creates: null,
      gasLimit,
      gasPrice,
      value: utils.bigNumberify(transaction.value || 0),
      networkId: 0,
      nonce: 0,
      transactionIndex: 0,
      confirmations: 0,
      to: await transaction.to,
      from: await this.signer.getAddress(),
      wait: async (confirmations = 0) => {
        const tx = await this.provider.getTransaction(hash)
        return {
          hash,
          logs: [],
          wait: async () => {
            const receipt = await this.provider.waitForTransaction(hash)
            if (receipt == null && confirmations === 0) {
              return null
            }

            if (receipt.status === 0) {
              ethers.errors.throwError(
                'transaction failed',
                ethers.errors.CALL_EXCEPTION,
                {
                  transactionHash: tx.hash,
                  transaction: tx,
                }
              )
            }
            return receipt
          },
        }
      },
    }
    return ret
  }

  // unused in project atm, but here for completeness
  signMessage(message) {
    return this.signer.signMessage(message)
  }
}
