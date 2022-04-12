/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable prefer-const */
import { BigInt, Bytes, Address, log } from '@graphprotocol/graph-ts'
import { PublicLock } from '../generated/templates/PublicLock/PublicLock'
import { PublicLock as PublicLock7 } from '../generated/templates/PublicLock7/PublicLock'
import { PublicLock as PublicLock10 } from '../generated/templates/PublicLock10/PublicLock'
import { Lock, LockManager, Lock } from '../generated/schema'
import {
  PublicLock as PublicLockTemplate,
  PublicLock7 as PublicLockTemplate7,
  PublicLock10 as PublicLockTemplate10,
} from '../generated/templates'

import { NewLock } from '../generated/Contract/Contract'

function addInitialLockManager(lockAddress: Bytes, manager: Bytes): void {
  let lockManager = new LockManager(lockAddress.toHex().concat(manager.toHex()))
  lockManager.lock = lockAddress.toHex()
  lockManager.address = manager
  lockManager.save()
}

function bootstrapLock(publicLock: PublicLock): Lock {
  let version = publicLock.try_publicLockVersion()
  let lock = new Lock(publicLock._address.toHexString())
  if (!version.reverted) {
    lock.version = BigInt.fromI32(version.value)
  } else {
    lock.version = BigInt.fromI32(0)
  }
  return lock
}

function processV10(event: NewLock, lock: Lock): void {
  let chainPublicLock = PublicLock10.bind(event.params.newLockAddress)
  lock.address = event.params.newLockAddress
  lock.price = chainPublicLock.keyPrice()
  lock.expirationDuration = chainPublicLock.expirationDuration()
  lock.creationBlock = event.block.number
  lock.owner = event.params.lockOwner

  let lockName = chainPublicLock.try_name()

  if (!lockName.reverted) {
    lock.name = lockName.value
  } else {
    lock.name = ''
  }

  let totalSupply = chainPublicLock.try_totalSupply()
  if (!totalSupply.reverted) {
    lock.totalSupply = totalSupply.value
  }

  let tokenAddress = chainPublicLock.try_tokenAddress()
  if (!tokenAddress.reverted) {
    lock.tokenAddress = tokenAddress.value
  } else {
    lock.tokenAddress = Address.fromString(
      '0000000000000000000000000000000000000000'
    )
  }

  PublicLockTemplate10.create(event.params.newLockAddress)
  lock.save()
  addInitialLockManager(lock.address, lock.owner as Bytes)
}

function processV7(event: NewLock, lock: Lock): void {
  let chainPublicLock = PublicLock7.bind(event.params.newLockAddress)
  lock.address = event.params.newLockAddress
  lock.price = chainPublicLock.keyPrice()
  lock.expirationDuration = chainPublicLock.expirationDuration()
  lock.creationBlock = event.block.number
  lock.owner = event.params.lockOwner

  let lockName = chainPublicLock.try_name()

  if (!lockName.reverted) {
    lock.name = lockName.value
  } else {
    lock.name = ''
  }

  let totalSupply = chainPublicLock.try_totalSupply()
  if (!totalSupply.reverted) {
    lock.totalSupply = totalSupply.value
  }

  let tokenAddress = chainPublicLock.try_tokenAddress()
  if (!tokenAddress.reverted) {
    lock.tokenAddress = tokenAddress.value
  } else {
    lock.tokenAddress = Address.fromString(
      '0000000000000000000000000000000000000000'
    )
  }

  PublicLockTemplate7.create(event.params.newLockAddress)
  lock.save()
  addInitialLockManager(lock.address, lock.owner as Bytes)
}

function processPreV7(event: NewLock, lock: Lock): void {
  let chainPublicLock = PublicLock.bind(event.params.newLockAddress)
  lock.address = event.params.newLockAddress
  lock.price = chainPublicLock.keyPrice()
  lock.expirationDuration = chainPublicLock.expirationDuration()
  lock.maxNumberOfKeys = chainPublicLock.maxNumberOfKeys()
  lock.owner = chainPublicLock.owner()
  lock.creationBlock = event.block.number
  let tokenAddress = chainPublicLock.try_tokenAddress()

  if (!tokenAddress.reverted) {
    lock.tokenAddress = tokenAddress.value
  } else {
    lock.tokenAddress = Address.fromString(
      '0000000000000000000000000000000000000000'
    )
  }
  let lockName = chainPublicLock.try_name()
  if (!lockName.reverted) {
    lock.name = lockName.value
  } else {
    lock.name = ''
  }
  let totalSupply = chainPublicLock.try_totalSupply()
  if (!totalSupply.reverted) {
    lock.totalSupply = totalSupply.value
  }
  PublicLockTemplate.create(event.params.newLockAddress)
  lock.save()
  addInitialLockManager(lock.address, lock.owner as Bytes)
}

export function processNewLock(event: NewLock): void {
  let lockAddress = event.params.newLockAddress
  let chainPublicLock = PublicLock.bind(lockAddress)

  let lock = bootstrapLock(chainPublicLock)

  if (lock.version >= BigInt.fromI32(10)) {
    processV10(event, lock)
  } else if (lock.version >= BigInt.fromI32(7)) {
    processV7(event, lock)
  } else {
    processPreV7(event, lock)
  }
}
