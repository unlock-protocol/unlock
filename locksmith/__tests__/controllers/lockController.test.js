const request = require('supertest')
const app = require('../../src/app')
const Lock = require('../../src/models').Lock

const validLockOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const validLockAddress = '0x21cC9C438D9751A3225496F6FD1F1215C7bd5D83'

const testLockDetails = {
  name: 'Test Lock',
  address: '0xab7c74abC0C4d48d1bdad5DCB26153FC8780f83E',
  owner: '0xCA750f9232C1c38e34D27e77534e1631526eC99e',
}

const ownedLocks = [
  {
    name: 'a mighty fine lock',
    address: 'jqfqod74',
    owner: '0x423893453',
  },
  {
    name: 'A random other lock',
    address: 'jqfqod75',
    owner: '0x423893453',
  },
]

const lockPayload = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
      {
        name: 'salt',
        type: 'bytes32',
      },
    ],
    Lock: [
      { name: 'name', type: 'string' },
      { name: 'owner', type: 'address' },
      { name: 'address', type: 'address' },
    ],
  },
  domain: { name: 'Unlock Dashboard', version: '1', chainId: 1984 },
  primaryType: 'Lock',
  message: {
    lock: {
      name: 'New Lock',
      owner: validLockOwner,
      address: validLockAddress,
    },
  },
}
const validLockSignature =
  'MHhkYTk4ZDY0MjVkZTc1NjAyNjFlYTM0MzVmNzFkYjhhYmFlY2JjYzM1ZjczNWZhZDM0OGQ2ODZkZGM2OTM0ZWE1M2FjOTY2ZmNhYjNkZTA0NmNmMjdjOGY1YmI5NGQ3ZjA0NzY0NWU2ZTczN2I0ZTQwZjAzZjJkMDg4Y2E2NWMxMDFi'

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
        let response = await request(app).get(
          `/lock/${testLockDetails.address}`
        )
        expect(response.body).toMatchObject({ name: 'Test Lock' })
      })

      test('should return an OK status code', async () => {
        expect.assertions(1)
        let response = await request(app).get(
          `/lock/${testLockDetails.address}`
        )
        expect(response.statusCode).toBe(200)
      })
    })

    describe('when the lock details are unavailable', () => {
      test('it should returns an appropriate error code', async () => {
        expect.assertions(1)
        let response = await request(app).get('/lock/0xdeadbeef')

        expect(response.statusCode).toBe(404)
      })
    })
  })

  describe('setting lock details', () => {
    describe('when this is a new lock', () => {
      test('it saves the passed the information', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130837000)

        await request(app)
          .post('/lock')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${validLockSignature}`)
          .send(lockPayload)

        let record = await Lock.findOne({
          where: { address: validLockAddress },
        })

        expect(record.name).toBe('New Lock')
      })

      test('it returns an OK status code', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130837000)
        let response = await request(app)
          .post('/lock')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${validLockSignature}`)
          .send(lockPayload)

        expect(response.statusCode).toBe(200)
      })
    })

    describe('when the lock exists', () => {
      describe('when the sender is the lock owner', () => {
        test('it updates the lock details', async () => {
          expect.assertions(2)
          Date.now = jest.fn(() => 1546467262000)

          await Lock.create({
            name: 'a mighty fine lock',
            address: validLockAddress,
            owner: validLockOwner,
          })

          let response = await request(app)
            .post('/lock')
            .set('Accept', /json/)
            .set('Authorization', `Bearer ${validLockSignature}`)
            .send(lockPayload)

          let lock = await Lock.findOne({
            where: { address: validLockAddress },
          })
          expect(lock.address).toBe(validLockAddress)
          expect(response.statusCode).toBe(202)
        })
      })

      describe('when the update requester is not the lock owner', () => {
        test('it returns a 401 status code', async () => {
          expect.assertions(1)
          Date.now = jest.fn(() => 1546467262000)
          await Lock.create({
            name: 'New Lock',
            address: validLockAddress,
            owner: '0',
          })

          let response = await request(app)
            .post('/lock')
            .set('Accept', /json/)
            .set('Authorization', `Bearer ${validLockSignature}`)
            .send(lockPayload)

          expect(response.statusCode).toBe(401)
        })
      })
    })
  })

  describe('Requesting locks for a given owner', () => {
    beforeAll(async () => {
      await Lock.bulkCreate(ownedLocks)
    })

    describe('when the address owns locks', () => {
      const owner = '0x423893453'

      it('return the details of the owned locks', async () => {
        expect.assertions(3)
        let response = await request(app)
          .get(`/${owner}/locks`)
          .set('Accept', /json/)

        expect(response.body.locks).toHaveLength(2)

        expect(response.body.locks).toContainEqual({
          name: 'a mighty fine lock',
          address: 'jqfqod74',
          owner: '0x423893453',
        })

        expect(response.body.locks).toContainEqual({
          name: 'A random other lock',
          address: 'jqfqod75',
          owner: '0x423893453',
        })
      })
    })

    describe('when the address does not own locks', () => {
      it('returns an empty collection', async () => {
        expect.assertions(1)
        let response = await request(app)
          .get('/0xd489fF3/locks')
          .set('Accept', /json/)
        expect(response.body).toEqual({ locks: [] })
      })
    })
  })
})
