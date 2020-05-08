import { ethers } from 'ethers'

import abis from '../../abis'

import Web3Service from '../../web3Service'

import { KEY_ID } from '../../constants'

const readOnlyProvider = 'http://127.0.0.1:8545'
const unlockAddress = '0xc43efE2C7116CB94d563b5A9D68F260CCc44256F'
const lockAddress = '0x5ED6a5BB0fDA25eaC3B5D03fa875cB60A4639d8E'

let web3Service

const UnlockVersion = abis.v1

describe('Web3Service', () => {
  beforeEach(() => {
    web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
    })
  })

  describe('inputsHandlers', () => {
    describe('createLock', () => {
      it('should emit lock.updated with correctly typed values', async () => {
        expect.assertions(4)

        const transaction = {
          hash: 'hash',
        }
        const newLockAddress = '0xnewLock'
        const params = {
          _expirationDuration: '7',
          _maxNumberOfKeys: '5',
          _keyPrice: '5',
          _lockName: 'hello',
        }
        const sender = '0xsender'
        web3Service.generateLockAddress = jest.fn(() =>
          Promise.resolve(newLockAddress)
        )
        web3Service.on('lock.updated', (newLockAddress, update) => {
          expect(update.expirationDuration).toBe(7)
          expect(update.maxNumberOfKeys).toBe(5)
          expect(web3Service.generateLockAddress).toHaveBeenCalledWith(sender, {
            name: params._lockName,
          })
        })

        await web3Service.inputsHandlers.createLock(
          transaction,
          '0x456',
          sender,
          params
        )
        expect(transaction).toEqual({ hash: 'hash', lock: '0xnewLock' })
      })
    })

    it('purchaseFor', async () => {
      expect.assertions(3)
      const sender = '0xsender'
      const owner = '0x9876'
      const fakeParams = {
        _recipient: owner,
      }
      const fakeContractAddress = '0xabc'
      const fakeHash = '0x12345'
      const transaction = {
        hash: fakeHash,
      }

      web3Service.once('key.saved', (id, params) => {
        expect(id).toBe(KEY_ID(fakeContractAddress, owner))
        expect(params).toEqual({
          owner,
          lock: fakeContractAddress,
        })
      })

      await web3Service.inputsHandlers.purchaseFor(
        transaction,
        fakeContractAddress,
        sender,
        fakeParams
      )
      expect(transaction).toEqual({
        for: owner,
        hash: fakeHash,
        key: KEY_ID(fakeContractAddress, owner),
        lock: fakeContractAddress,
      })
    })
  })

  describe('_parseTransactionLogsFromReceipt', () => {
    const encoder = ethers.utils.defaultAbiCoder

    describe('events', () => {
      it('handles the NewLock event from Unlock contract', async () => {
        expect.assertions(4)
        const EventInfo = new ethers.utils.Interface(UnlockVersion.Unlock.abi)
        const receipt = {
          blockNumber: 123,
          logs: [
            {
              address: lockAddress,
              data: encoder.encode(
                ['address', 'address'],
                [unlockAddress, lockAddress]
              ),
              topics: [
                EventInfo.events['NewLock(address,address)'].topic,
                encoder.encode(['address'], [unlockAddress]),
                encoder.encode(['address'], [lockAddress]),
              ],
            },
          ],
        }
        const transaction = {
          hash: 'hash',
        }

        web3Service.on('lock.updated', (lockAddress, lock) => {
          expect(lockAddress).toBe(lockAddress)
          expect(lock).toEqual({
            asOf: 123,
            transaction: 'hash',
            address: lockAddress,
          })
        })

        web3Service.getLock = jest.fn()
        await web3Service._parseTransactionLogsFromReceipt(
          transaction,
          UnlockVersion.Unlock,
          receipt,
          lockAddress
        )
        expect(web3Service.getLock).toHaveBeenCalledWith(lockAddress)
        expect(transaction).toEqual({
          hash: transaction.hash,
          lock: lockAddress,
        })
      })

      it('handles the PriceChanged event from PublicLock contract', async () => {
        expect.assertions(3)
        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const receipt = {
          blockNumber: 123,
          logs: [
            {
              address: lockAddress,
              data: encoder.encode(['uint256', 'uint256'], [1, 2]),
              topics: [
                EventInfo.events['PriceChanged(uint256,uint256)'].topic,
                encoder.encode(['uint256'], [1]),
                encoder.encode(['uint256'], [2]),
              ],
            },
          ],
        }

        const hash = 'hash'
        const transaction = {
          hash,
        }

        web3Service.on('lock.updated', (address, lock) => {
          expect(address).toBe(lockAddress)
          expect(lock).toEqual({
            asOf: 123,
            keyPrice: '0.000000000000000002',
          })
        })

        web3Service._parseTransactionLogsFromReceipt(
          transaction,
          UnlockVersion.PublicLock,
          receipt,
          lockAddress
        )
        expect(transaction).toEqual({
          hash,
          lock: lockAddress,
        })
      })

      it('handles the Transfer event from PublicLock contract', async () => {
        expect.assertions(3)
        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const owner = lockAddress
        const receipt = {
          blockNumber: 123,
          logs: [
            {
              address: lockAddress,
              data: encoder.encode(['uint256', 'uint256'], [1, 2]),
              topics: [
                EventInfo.events['Transfer(address,address,uint256)'].topic,
                encoder.encode(['uint256'], [unlockAddress]),
                encoder.encode(['uint256'], [lockAddress]),
                encoder.encode(['uint256'], [2]),
              ],
            },
          ],
        }
        const hash = 'hash'
        const transaction = {
          hash,
        }

        web3Service.on('key.saved', (id, key) => {
          expect(id).toBe(KEY_ID(lockAddress, owner))
          expect(key).toEqual({
            lock: lockAddress,
            owner,
          })
        })

        await web3Service._parseTransactionLogsFromReceipt(
          transaction,
          UnlockVersion.PublicLock,
          receipt,
          lockAddress
        )
        expect(transaction).toEqual({
          hash,
          for: owner,
          lock: lockAddress,
          key: KEY_ID(lockAddress, owner),
        })
      })

      it('handles the Withdrawal event from PublicLock contract', async () => {
        expect.assertions(1)
        const EventInfo = new ethers.utils.Interface(
          UnlockVersion.PublicLock.abi
        )
        const receipt = {
          blockNumber: 123,
          logs: [
            {
              address: lockAddress,
              data: encoder.encode(['address', 'uint256'], [unlockAddress, 2]),
              topics: [
                EventInfo.events['Withdrawal(address,uint256)'].topic,
                encoder.encode(['address'], [unlockAddress]),
                encoder.encode(['uint256'], [2]),
              ],
            },
          ],
        }

        const hash = 'hash'
        const transaction = {
          hash,
        }

        await web3Service._parseTransactionLogsFromReceipt(
          transaction,
          UnlockVersion.PublicLock,
          receipt,
          lockAddress
        )
        expect(transaction).toEqual({
          hash,
          lock: lockAddress,
        })
      })
    })
  })
})
