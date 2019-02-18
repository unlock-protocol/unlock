import { makeGetLockAttributes } from '../../../hooks/asyncActions/locks'
import { MAX_UINT, UNLIMITED_KEYS_COUNT } from '../../../constants'

describe('useLock async lock actions', () => {
  describe('makeGetLockAttributes', () => {
    const defaultContract = {
      keyPrice: '400000000000000000',
      expirationDuration: 12345,
      maxNumberOfKeys: 100,
      owner: '0x123',
      outstandingKeys: 2,
    }
    const web3 = {
      eth: {
        getBalance: () => Promise.resolve('123000000000000000'),
        getBlockNumber: () => Promise.resolve(123),
      },
    }
    const lockAddress = 'address'

    function makeMockAttribute(val) {
      return () => ({
        call: () => Promise.resolve(val),
      })
    }
    function getMockContract(changes = {}) {
      const contract = {
        ...defaultContract,
        ...changes,
      }
      return {
        methods: Object.keys(contract).reduce((coll, attribute) => {
          coll[attribute] = makeMockAttribute(contract[attribute])
          return coll
        }, {}),
      }
    }

    let setLock

    beforeEach(() => {
      setLock = jest.fn()
    })

    it('returns the contract', async () => {
      const contract = getMockContract()

      const getLockAttributes = makeGetLockAttributes({
        web3,
        lockAddress,
        setLock,
      })

      await getLockAttributes(contract)

      expect(setLock).toHaveBeenCalledWith({
        address: lockAddress,
        keyPrice: '0.4',
        expirationDuration: 12345,
        maxNumberOfKeys: 100,
        unlimitedKeys: false,
        owner: '0x123',
        outstandingKeys: 2,
        balance: '0.123',
        asOf: 123,
      })
    })
    it('sets unlimited keys when maxNumberOfKeys is unlimited', async () => {
      const contract = getMockContract({ maxNumberOfKeys: MAX_UINT })

      const getLockAttributes = makeGetLockAttributes({
        web3,
        lockAddress,
        setLock,
      })

      await getLockAttributes(contract)

      expect(setLock).toHaveBeenCalledWith({
        address: lockAddress,
        keyPrice: '0.4',
        expirationDuration: 12345,
        maxNumberOfKeys: UNLIMITED_KEYS_COUNT,
        unlimitedKeys: true,
        owner: '0x123',
        outstandingKeys: 2,
        balance: '0.123',
        asOf: 123,
      })
    })
  })
})
