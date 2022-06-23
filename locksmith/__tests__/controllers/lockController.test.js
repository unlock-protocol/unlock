const request = require('supertest')
const app = require('../../src/app')
const { Lock } = require('../../src/models')

const validLockOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const validLockAddress = '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83'
const chain = 31337

const testLockDetails = {
  chain,
  name: 'Test Lock',
  address: '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83',
  owner: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
}

const ownedLocks = [
  {
    chain,
    name: 'a mighty fine lock',
    address: '0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83A',
    owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
  },
  {
    chain,
    name: 'A random other lock',
    address: '0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83B',
    owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
  },
]

const lockPayload = {
  types: {
    Lock: [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'address', type: 'address' },
    ],
  },
  domain: { name: 'Unlock Dashboard', version: '1', chainId: 31337 },
  primaryType: 'Lock',
  message: {
    lock: {
      name: 'New Lock',
      owner: validLockOwner,
      address: validLockAddress,
    },
  },
  messageKey: 'lock',
}

beforeEach(async () => {
  await Lock.create(testLockDetails)
})

afterEach(async () => {
  await Lock.truncate()
})

describe('lockController', () => {
  describe('retrieving details for a lock', () => {
    describe('when the lock details are available', () => {
      test('it should return the name of the lock', async () => {
        expect.assertions(1)
        const response = await request(app).get(
          `/lock/${testLockDetails.address}`
        )
        expect(response.body).toMatchObject({ name: 'Unlock Key' })
      })

      test('should return an OK status code', async () => {
        expect.assertions(1)
        const response = await request(app).get(
          `/lock/${testLockDetails.address}`
        )
        expect(response.statusCode).toBe(200)
      })
    })
  })

  describe('setting lock details', () => {
    describe('when this is a new lock', () => {
      test('it saves the passed the information', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130837000)

        await request(app)
          .post('/lock?network=31337')
          .set('Accept', /json/)
          .send(lockPayload)

        const record = await Lock.findOne({
          where: { address: validLockAddress },
        })

        expect(record.address).toBe(validLockAddress)
      })

      test('it returns an OK status code', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130837000)
        const response = await request(app)
          .post('/lock')
          .set('Accept', /json/)
          .send(lockPayload)

        expect(response.statusCode).toBe(200)
      })
    })
  })

  describe('Requesting locks for a given owner', () => {
    beforeAll(async () => {
      await Lock.bulkCreate(ownedLocks)
    })

    describe('when the address owns locks', () => {
      const owner = '0xCA750f9232C1c38e34D27e77534e1631526eC99e'

      it('return the details of the owned locks', async () => {
        expect.assertions(3)
        const response = await request(app)
          .get(`/${owner}/locks`)
          .set('Accept', /json/)

        expect(response.body.locks).toHaveLength(2)

        expect(response.body.locks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'A random other lock',
              address: '0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83B',
              owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
            }),
          ])
        )

        expect(response.body.locks).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'a mighty fine lock',
              address: '0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83A',
              owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
            }),
          ])
        )
      })
    })

    describe('when the address does not own locks', () => {
      it('returns an empty collection', async () => {
        expect.assertions(1)
        const response = await request(app)
          .get('/0xCA750f9232C1c38e34D27e77534e1631526eC99e/locks')
          .set('Accept', /json/)
        expect(response.body).toEqual({ locks: [] })
      })
    })
  })
})
