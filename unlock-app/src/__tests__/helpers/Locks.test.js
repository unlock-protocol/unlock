import {getLockTransaction, getLockConfirmations, getLockStatusString} from '../../helpers/Locks'
import configure from '../../config'

const config = configure(global)

describe('lockHelpers', () => {
  it ('should retrieve a transaction from a lock when a match exists', () => {
    const Lock = {
      address: '0x1234567890',
    }
    const transactions = {
      all: {
        notTheTransactionWereLookingFor: {
          hash: 'notTheTransactionWereLookingFor',
          confirmations: 24,
          lock: {
            address: '0x0987654321',
          },
        },
        theTransactionWereLookingFor: {
          hash: 'theTransactionWereLookingFor',
          confirmations: 12,
          lock: {
            address: '0x1234567890',
          },
        },
      },
    }

    expect(getLockTransaction(transactions, Lock.address).hash).toEqual('theTransactionWereLookingFor')
  })
  it ('should not retrieve a transaction from a lock when no match exists', () => {
    const Lock = {
      address: '0x9999999999',
    }
    const transactions = {
      all: {
        notTheTransactionWereLookingFor: {
          hash: 'notTheTransactionWereLookingFor',
          confirmations: 24,
          lock: {
            address: '0x0987654321',
          },
        },
        theTransactionWereLookingFor: {
          hash: 'theTransactionWereLookingFor',
          confirmations: 12,
          lock: {
            address: '0x1234567890',
          },
        },
      },
    }

    expect(getLockTransaction(transactions, Lock.address)).toEqual(null)
  })
  it ('should retrieve confirmations from a lock when a match exists', () => {
    const Lock = {
      address: '0x1234567890',
    }
    const transactions = {
      all: {
        notTheTransactionWereLookingFor: {
          hash: 'notTheTransactionWereLookingFor',
          confirmations: 24,
          lock: {
            address: '0x0987654321',
          },
        },
        theTransactionWereLookingFor: {
          hash: 'theTransactionWereLookingFor',
          confirmations: 12,
          lock: {
            address: '0x1234567890',
          },
        },
      },
    }

    expect(getLockConfirmations(transactions, Lock.address)).toEqual(12)
  })
  it ('should retrieve no confirmations from a lock when no match exists', () => {
    const Lock = {
      address: '0x99999999999',
    }
    const transactions = {
      all: {
        notTheTransactionWereLookingFor: {
          hash: 'notTheTransactionWereLookingFor',
          confirmations: 24,
          lock: {
            address: '0x0987654321',
          },
        },
        theTransactionWereLookingFor: {
          hash: 'theTransactionWereLookingFor',
          confirmations: 12,
          lock: {
            address: '0x1234567890',
          },
        },
      },
    }

    expect(getLockConfirmations(transactions, Lock.address)).toEqual(null)
  })

  it ('should return the status "deployed" for locks with mined transactions and at least the number of required confirmations', () => {
    const Lock = {
      address: '0x1234567890',
    }
    const transactions = {
      all: {
        theTransactionWereLookingFor: {
          hash: 'theTransactionWereLookingFor',
          confirmations: config.requiredConfirmations,
          status: 'mined',
          lock: {
            address: '0x1234567890',
          },
        },
      },
    }

    expect(getLockStatusString(transactions, Lock.address)).toEqual('deployed')
  })

  it ('should return the status "confirming" for locks with mined transactions and under the required number of confirmations', () => {
    const Lock = {
      address: '0x1234567890',
    }
    const transactions = {
      all: {
        theTransactionWereLookingFor: {
          hash: 'theTransactionWereLookingFor',
          confirmations: config.requiredConfirmations-1,
          status: 'mined',
          lock: {
            address: '0x1234567890',
          },
        },
      },
    }

    expect(getLockStatusString(transactions, Lock.address)).toEqual('confirming')
  })
})
