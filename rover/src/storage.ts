import 'reflect-metadata'
import { Transaction } from './entity/Transaction'
import { Block } from './entity/Block'
import { RegistryKey } from './entity/RegistryKey'

export class Storage {
  connectionManager

  constructor(connectionManager) {
    this.connectionManager = connectionManager
  }

  storeBlock = blockDetails => {
    let block = new Block()
    block.hash = blockDetails.hash
    block.parentHash = blockDetails.parentHash
    block.number = blockDetails.number
    block.timestamp = blockDetails.timestamp
    block.nonce = blockDetails.nonce
    block.difficulty = blockDetails.difficulty
    block.gasLimit = String(blockDetails.gasLimit)
    block.gasUsed = String(blockDetails.gasUsed)
    block.miner = blockDetails.miner
    block.extraData = blockDetails.extraData

    this.connectionManager.save(block)
  }

  storeTransaction = td => {
    let transaction = new Transaction()
    transaction.nonce = td.nonce
    transaction.hash = td.hash
    transaction.blockHash = td.blockHash
    transaction.blockNumber = td.blockNumber
    transaction.transactionIndex = td.transactionIndex
    transaction.confirmations = td.confirmations
    transaction.from = td.from
    transaction.to = td.to
    transaction.value = td.value
    transaction.nonce = td.nonce
    transaction.data = td.data
    transaction.r = td.r
    transaction.s = td.s
    transaction.v = td.v
    transaction.creates = td.creates
    transaction.raw = td.raw
    transaction.networkId = td.networkId
    transaction.gasLimit = td.gasLimit
    transaction.gasPrice = td.gasPrice

    this.connectionManager.save(transaction)
  }

  storeRegistree = data => {
    let registree = new RegistryKey()
    registree.address = data.address

    this.connectionManager.save(registree)
  }
}
