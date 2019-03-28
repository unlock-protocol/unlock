import { mapStateToProps } from '../../../components/content/DashboardContent'

const transactions = {
  '0x1234': {
    hash: '0x12345678',
    confirmations: 12,
    status: 'mined',
    lock: '0x12345678a',
    blockNumber: 1,
  },
  '0x5678': {
    hash: '0x56781234',
    confirmations: 4,
    status: 'mined',
    lock: '0x56781234a',
    blockNumber: 2,
  },
  '0x89ab': {
    hash: '0x9abcdef0',
    confirmations: 2,
    status: 'mined',
    lock: '0x9abcdef0a',
    blockNumber: 3,
  },
}
const locks = {
  '0x56781234a': {
    address: '0x56781234a',
    name: 'The Beta Blog',
    keyPrice: '10000000000000000000',
    expirationDuration: 86400,
    maxNumberOfKeys: 800,
    outstandingKeys: 32,
    transaction: '0x5678',
  },
  '0x12345678a': {
    address: '0x12345678a',
    name: 'The Alpha Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 240,
    outstandingKeys: 3,
    transaction: '0x1234',
  },
  '0x9abcdef0a': {
    address: '0x9abcdef0',
    name: 'The Gamma Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 0,
    outstandingKeys: 10,
    transaction: '0x89ab',
  },
}
const locksMinusATransaction = {
  '0x56781234a': {
    address: '0x56781234a',
    name: 'The Beta Blog',
    keyPrice: '10000000000000000000',
    expirationDuration: 86400,
    maxNumberOfKeys: 800,
    outstandingKeys: 32,
  },
  '0x12345678a': {
    address: '0x12345678a',
    name: 'The Alpha Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 240,
    outstandingKeys: 3,
    transaction: '0x1234',
  },
  '0x9abcdef0a': {
    address: '0x9abcdef0',
    name: 'The Gamma Blog',
    keyPrice: '27000000000000000',
    expirationDuration: 172800,
    maxNumberOfKeys: 0,
    outstandingKeys: 10,
    transaction: '0x89ab',
  },
}

const account = {
  address: '0x12345678',
  balance: '5',
}

const network = {
  name: 1984,
}

const lockFormStatus = {
  visible: false,
}

describe('DashboardContent', () => {
  it('should sort locks in descending order by blockNumber', () => {
    expect.assertions(4)
    const state = {
      account,
      network,
      locks,
      transactions,
      lockFormStatus,
    }

    const props = mapStateToProps(state)
    const lockFeed = props.lockFeed

    expect(lockFeed).toHaveLength(3)
    // Lock "The Gamma Blog" has the highest blockNumber, so it should always appear first
    expect(lockFeed[0].name).toEqual('The Gamma Blog')
    // "The Beta Blog" has the second highest blockNumber, so it should appear second
    expect(lockFeed[1].name).toEqual('The Beta Blog')
    // "The Alpha Blog" with the lowest  blockNumber appears last
    expect(lockFeed[2].name).toEqual('The Alpha Blog')
  })

  it('should also sort correctly when a lock has no transaction yet', () => {
    expect.assertions(4)
    const state = {
      account,
      network,
      locks: locksMinusATransaction,
      transactions,
      lockFormStatus,
    }

    const props = mapStateToProps(state)
    const lockFeed = props.lockFeed

    expect(lockFeed).toHaveLength(3)
    // This time "The Beta Blog" has no associated transaction, which means it is a brand
    // new lock, and should always appear at the head of the list.
    expect(lockFeed[0].name).toEqual('The Beta Blog')
    // "The Gamma Blog" then has the highest blockNumber, so it should come next.
    expect(lockFeed[1].name).toEqual('The Gamma Blog')
    // And "The Alpha Blog" with the lowest blockNumber comes last again.
    expect(lockFeed[2].name).toEqual('The Alpha Blog')
  })
})
