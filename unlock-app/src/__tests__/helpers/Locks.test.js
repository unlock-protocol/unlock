import { getLockTransaction, getLockConfirmations, getLockStatusString } from '../../helpers/Locks'
import configure from '../../config'

const config = configure(global)

  describe('getLockTransaction', () => {

    it('should retrieve a transaction from a lock when a match exists', () => {
      const lock = {
        id: '1337',
      }
      const transactions = {
        all: {
          notTheTransactionWereLookingFor: {
            hash: 'notTheTransactionWereLookingFor',
            confirmations: 24,
            lock: '987654321',
          },
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            confirmations: 12,
            lock: '1337',
          },
        },
      }

      expect(getLockTransaction(transactions, lock.id).hash).toEqual('theTransactionWereLookingFor')
    })

    it('should not retrieve a transaction from a lock when no match exists', () => {
      const lock = {
        id: '404',
      }
      const transactions = {
        all: {
          notTheTransactionWereLookingFor: {
            hash: 'notTheTransactionWereLookingFor',
            confirmations: 24,
            lock: '987654321',
          },
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            confirmations: 12,
            lock: '1234567890',
          },
        },
      }

      expect(getLockTransaction(transactions, lock.address)).toEqual(null)
    })
  })

  describe('getLockConfirmations', () => {

    it('should retrieve confirmations from a lock when a match exists', () => {
      const lock = {
        id: '1234567890',
      }
      const transactions = {
        all: {
          notTheTransactionWereLookingFor: {
            hash: 'notTheTransactionWereLookingFor',
            confirmations: 24,
            lock: '987654321',
          },
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            confirmations: 12,
            lock: '1234567890',
          },
        },
      }

      expect(getLockConfirmations(transactions, lock.id)).toEqual(12)
    })

    it('should retrieve no confirmations from a lock when no match exists', () => {
      const lock = {
        id: '99999999999',
      }
      const transactions = {
        all: {
          notTheTransactionWereLookingFor: {
            hash: 'notTheTransactionWereLookingFor',
            confirmations: 24,
            lock: '0987654321',
          },
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            confirmations: 12,
            lock: '1234567890',
          },
        },
      }

      expect(getLockConfirmations(transactions, lock.id)).toEqual(null)
    })
  })

  describe('getLockStatusString', () => {

    it('should return the status "deployed" for locks with mined transactions and at least the number of required confirmations', () => {
      const lock = {
        id: '1234567890',
      }
      const transactions = {
        all: {
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            confirmations: config.requiredConfirmations,
            status: 'mined',
            lock: '1234567890',
          },
        },
      }

      expect(getLockStatusString(transactions, lock.id)).toEqual('deployed')
    })

    it('should return the status "submitted" for locks whose transaction has been submitted but not been mined yet', () => {
      const lock = {
        id: '1234567890',
      }
      const transactions = {
        all: {
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            status: 'submitted',
            lock: '1234567890',
          },
        },
      }

      expect(getLockStatusString(transactions, lock.id)).toEqual('submitted')
    })

    it('should return the status "confirming" for locks with mined transactions and under the required number of confirmations', () => {
      const lock = {
        id: '1234567890',
      }
      const transactions = {
        all: {
          theTransactionWereLookingFor: {
            hash: 'theTransactionWereLookingFor',
            confirmations: config.requiredConfirmations - 1,
            status: 'mined',
            lock: '1234567890',
          },
        },
      }

      expect(getLockStatusString(transactions, lock.id)).toEqual('confirming')
    })
  })

})
