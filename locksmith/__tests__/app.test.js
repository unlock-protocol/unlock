const request = require('supertest')
const app = require('../src/app')
const Lock = require('../src/lock')
const Transaction = require('../src/transaction')

const validLockOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

const testLockDetails = {
  name: 'Test Lock',
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  owner: '0xdeadbed123',
}

const lockUpdateDetails = {
  currentAddress: 'jqfqod74',
  address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a',
  owner: validLockOwner,
}

const validLockDetails = {
  address: 'jqa6dnp1',
  name: 'oioioi',
  expirationDuration: 2592000,
  keyPrice: '10000000000000000',
  maxNumberOfKeys: 10,
  owner: validLockOwner,
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

const savingLockHeader =
  'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE2ZG5wMSIsIm5hbWUiOiJva' +
  'W9pb2kiLCJleHBpcmF0aW9uRHVyYXRpb24iOjI1OTIwMDAsImtleVByaWNlIjoiMTAwMDAwMDAwMDAwMDAwMDAiLCJtYXhOd' +
  'W1iZXJPZktleXMiOjEwLCJvd25lciI6IjB4QWFBZEVFRDRjMEI4NjFjQjM2ZjRjRTAwNmE5QzkwQkEyRTQzZmRjMiJ9LCJpY' +
  'XQiOjE1NDYxMzA4MzUsImV4cCI6MTU0NjEzMDgzOCwiaXNzIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQ' +
  'TJFNDNmZGMyIn0.0xd36a7842eda1b2267c08b204407f9e71024a2152ae772882a1fa41a02696aee578688f02ef6c301' +
  '451de95793bde669198359f0820fb35f6ba1303e89727a52601'
const updatingLockHeader =
  'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJjdXJyZW50QWRkcmVzcyI6ImpxZnFvZDc0IiwiYWRkcmVzcyI6' +
  'IjB4NDk4M0Q1RUNEYzVjYzBFNDk5YzJEMjNCRjRBYzMyQjk4MmJBZTUzYSIsIm93bmVyIjoiMHhBYUFkRUVENGMwQjg2MWN' +
  'CMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIiwiaWF0IjoxNTQ2NDY3MjYxLCJleHAiOjE1NDY0NjcyNjQsImlzcyI6IjB4QW' +
  'FBZEVFRDRjMEI4NjFjQjM2ZjRjRTAwNmE5QzkwQkEyRTQzZmRjMiJ9.0x0c3affb75a12cbf7e3c732aed4bf82dbe5c4ba' +
  'ddf10ecb354585a5b7e328d25552a9092d7fd518c4ff21b0f5860fda6041a2340d2ad86b7150a0dfbf15c82c1500'

beforeEach(async () => {
  await Lock.create(testLockDetails)
})

afterEach(async () => {
  await Lock.truncate()
})

describe('Requesting lock details', () => {
  describe('when the lock details are available', () => {
    test('it should return the name of the lock', async () => {
      expect.assertions(1)
      let response = await request(app).get(`/lock/${testLockDetails.address}`)
      expect(response.body).toMatchObject({ name: 'Test Lock' })
    })

    test('should return an OK status code', async () => {
      expect.assertions(1)
      let response = await request(app).get(`/lock/${testLockDetails.address}`)
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

  describe('Setting lock details', () => {
    test('it saves the passed the information', async () => {
      expect.assertions(1)
      Date.now = jest.fn(() => 1546130837000)

      await request(app)
        .post('/lock')
        .set('Accept', /json/)
        .set('Authorization', savingLockHeader)
        .send(validLockDetails)

      let record = await Lock.findOne({ where: { address: 'jqa6dnp1' } })
      expect(record.name).toBe(validLockDetails.name)
    })

    test('it returns an OK status code', async () => {
      expect.assertions(1)
      Date.now = jest.fn(() => 1546130837000)
      let response = await request(app)
        .post('/lock')
        .set('Accept', /json/)
        .set('Authorization', savingLockHeader)
        .send(validLockDetails)

      expect(response.statusCode).toBe(200)
    })

    describe('when attempting to set details for an existing lock', () => {
      test('it return a 412 status code', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546130837000)

        await Lock.create({
          address: validLockDetails.address,
          owner: validLockDetails.owner,
        })

        let response = await request(app)
          .post('/lock')
          .set('Accept', /json/)
          .set('Authorization', savingLockHeader)
          .send(validLockDetails)

        expect(response.statusCode).toBe(412)
      })
    })
  })

  describe('Updating lock details', () => {
    describe('when the lock exists', () => {
      test('it updates the lock details', async () => {
        expect.assertions(2)
        Date.now = jest.fn(() => 1546467262000)

        await Lock.create({
          name: 'a mighty fine lock',
          address: 'jqfqod74',
          owner: validLockOwner,
        })

        let response = await request(app)
          .put('/lock/jqfqod74')
          .set('Accept', /json/)
          .set('Authorization', updatingLockHeader)
          .send(lockUpdateDetails)

        let lock = await Lock.findOne({
          where: { address: lockUpdateDetails.address },
        })
        expect(lock.address).toBe(lockUpdateDetails.address)
        expect(response.statusCode).toBe(202)
      })
    })

    describe('when the lock does not currently exist', () => {
      test('it returns a 412 status code', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546467262000)
        let response = await request(app)
          .put('/lock/jqfqod74')
          .set('Accept', /json/)
          .set('Authorization', updatingLockHeader)
          .send(lockUpdateDetails)

        expect(response.statusCode).toBe(412)
      })
    })

    describe('when the update requester is not the lock owner', () => {
      test('it returns a 412 status code', async () => {
        expect.assertions(1)
        Date.now = jest.fn(() => 1546467262000)
        await Lock.create({
          name: 'a mighty fine lock',
          address: 'jqfqod74',
          owner: '0x423893453',
        })

        let response = await request(app)
          .put('/lock/jqfqod74')
          .set('Accept', /json/)
          .set('Authorization', updatingLockHeader)
          .send(lockUpdateDetails)

        expect(response.statusCode).toBe(412)
      })
    })
  })
})

describe('Requesting Lock details of a given address', () => {
  beforeAll(async () => {
    await Lock.bulkCreate(ownedLocks)
  })

  describe('when the address owns locks', () => {
    const owner = '0x423893453'
    it('return the details of the owned locks', async () => {
      expect.assertions(1)

      const comparator = (a, b) => a.address - b.address

      let response = await request(app)
        .get(`/${owner}/locks`)
        .set('Accept', /json/)

      expect(response.body.locks.sort(comparator)).toEqual(
        [
          {
            name: 'a mighty fine lock',
            address: 'jqfqod74',
          },
          {
            name: 'A random other lock',
            address: 'jqfqod75',
          },
        ].sort(comparator)
      )
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

  describe('Requesting transaction details', () => {
    beforeEach(async () => {
      await Transaction.bulkCreate([
        {
          transactionHash: '0x345546565',
          sender: '0xcafe',
          recipient: '0xbeefe',
        },
        {
          transactionHash: '0x445546565',
          sender: '0xcafe',
          recipient: '0xbeefe',
        },
        {
          transactionHash: '0x545546565',
          sender: '0xcafe2',
          recipient: '0xbeefe',
        },
      ])
    })

    afterEach(async () => {
      await Transaction.truncate()
    })

    describe('when the address has 0 transactions', async () => {
      it('returns an empty collection', async () => {
        expect.assertions(1)
        let response = await request(app)
          .get('/transactions')
          .query({ sender: '0xd489fF3' })
          .set('Accept', /json/)
        expect(response.body).toEqual({ transactions: [] })
      })
    })

    describe('when the address has transactions', () => {
      it("returns the addresses' transactions", async () => {
        expect.assertions(1)
        let sender = '0xcafe'

        let response = await request(app)
          .get('/transactions')
          .query({ sender: sender })
          .set('Accept', /json/)

        expect(response.body.transactions.length).toEqual(2)
      })
    })

    describe('storing a transaction', () => {
      it('stores the provided transaction', async () => {
        expect.assertions(2)

        let response = await request(app)
          .post('/transaction')
          .set('Accept', /json/)
          .send({
            transactionHash: '0xsdbegjkbg,egf',
            sender: 'sdgergr',
            recipient: 'sdag433r',
          })

        let record = await Transaction.findOne({
          where: { sender: 'sdgergr', recipient: 'sdag433r' },
        })
        expect(record.sender).toBe('sdgergr')
        expect(response.statusCode).toBe(200)
      })
    })
  })
})
