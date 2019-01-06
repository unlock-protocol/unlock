const request = require('supertest')
const app = require('../src/app')
const Lock = require('../src/lock')

const testLockDetails = {
  name: 'Test Lock',
  address: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
  owner: '0xdeadbed123',
} 

const validLockOwner = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'
const validLockDetails  =  {
  address: 'jqa6dnp1',
  name: 'oioioi',
  expirationDuration: 2592000,
  keyPrice: '10000000000000000',
  maxNumberOfKeys: 10,
  owner: validLockOwner,
}

const lockUpdateDetails = {
  currentAddress: 'jqfqod74',
  address: '0x4983D5ECDc5cc0E499c2D23BF4Ac32B982bAe53a',
  owner: validLockOwner,
} 

const savingLockHeader = 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJsb2NrIjp7ImFkZHJlc3MiOiJqcWE2ZG5wMSIsIm5hbWUiOiJva' + 
                         'W9pb2kiLCJleHBpcmF0aW9uRHVyYXRpb24iOjI1OTIwMDAsImtleVByaWNlIjoiMTAwMDAwMDAwMDAwMDAwMDAiLCJtYXhOd' +
                         'W1iZXJPZktleXMiOjEwLCJvd25lciI6IjB4QWFBZEVFRDRjMEI4NjFjQjM2ZjRjRTAwNmE5QzkwQkEyRTQzZmRjMiJ9LCJpY' +
                         'XQiOjE1NDYxMzA4MzUsImV4cCI6MTU0NjEzMDgzOCwiaXNzIjoiMHhBYUFkRUVENGMwQjg2MWNCMzZmNGNFMDA2YTlDOTBCQ' + 
                         'TJFNDNmZGMyIn0.0xd36a7842eda1b2267c08b204407f9e71024a2152ae772882a1fa41a02696aee578688f02ef6c301' +
                         '451de95793bde669198359f0820fb35f6ba1303e89727a52601'
const updatingLockHeader ='Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJjdXJyZW50QWRkcmVzcyI6ImpxZnFvZDc0IiwiYWRkcmVzcyI6' + 
                          'IjB4NDk4M0Q1RUNEYzVjYzBFNDk5YzJEMjNCRjRBYzMyQjk4MmJBZTUzYSIsIm93bmVyIjoiMHhBYUFkRUVENGMwQjg2MWN' + 
                          'CMzZmNGNFMDA2YTlDOTBCQTJFNDNmZGMyIiwiaWF0IjoxNTQ2NDY3MjYxLCJleHAiOjE1NDY0NjcyNjQsImlzcyI6IjB4QW' + 
                          'FBZEVFRDRjMEI4NjFjQjM2ZjRjRTAwNmE5QzkwQkEyRTQzZmRjMiJ9.0x0c3affb75a12cbf7e3c732aed4bf82dbe5c4ba' +
                          'ddf10ecb354585a5b7e328d25552a9092d7fd518c4ff21b0f5860fda6041a2340d2ad86b7150a0dfbf15c82c1500'

beforeEach(done => {
  Lock.create(testLockDetails).then(() => {
    done()
  })
})

afterEach(done => {
  Lock.truncate().then(() => {
    done()
  })
})

describe('Requesting lock details', () => {
  describe('when the lock details are available', () => {
    test('it should return the name of the lock', () => {
      return request(app)
        .get(`/lock/${testLockDetails.address}`)
        .then(response => {
          expect(response.body).toMatchObject({ name: 'Test Lock' })
        })
    })

    test('should return an OK status code', () => {
      return request(app)
        .get(`/lock/${testLockDetails.address}`)
        .then(response => {
          expect(response.statusCode).toBe(200)
        })
    })
  })

  describe('when the lock details are unavailable', () => {
    test('it should returns an appropriate error code', () => {
      return request(app)
        .get('/lock/0xdeadbeef')
        .then(response => {
          expect(response.statusCode).toBe(404)
        })
    })
  })

  describe('Setting lock details', () => {
    test('it saves the passed the information', done => {
      Date.now = jest.fn(() => 1546130837000)
      return request(app)
        .post('/lock')
        .set('Accept', /json/)
        .set('Authorization', savingLockHeader)
        .send(validLockDetails)
        .then(() => {
          Lock.findOne({ where: { address: 'jqa6dnp1' } }).then(record => {
            expect(record.name).toBe(validLockDetails.name)
            done()
          })
        })
    })

    test('it returns an OK status code', done => {
      Date.now = jest.fn(() => 1546130837000)
      return request(app)
        .post('/lock')
        .set('Accept', /json/)
        .set('Authorization', savingLockHeader)
        .send(validLockDetails)
        .then(response => {
          expect(response.statusCode).toBe(200)
          done()
        })
    })

    describe('when attempting to set details for an existing lock', () =>{
      test('it return a 412 status code', done => {
        Date.now = jest.fn(() => 1546130837000)
        Lock.create({
          address: validLockDetails.address,
          owner: validLockDetails.owner,
        }).then(() => {
          request(app)
            .post('/lock')
            .set('Accept', /json/)
            .set('Authorization', savingLockHeader)
            .send(validLockDetails)
            .then(response => {
              expect(response.statusCode).toBe(412)
              done()
            })        
        })
      })
    })
  })

  describe('Updating lock details', () => {
    describe('when the lock exists', () => {
      test('it updates the lock details', done => {
        Date.now = jest.fn(() => 1546467262000)

        Lock.create({
          name: 'a mighty fine lock',
          address: 'jqfqod74',
          owner: validLockOwner,
        }).then(() => {
          request(app)
            .put('/lock/jqfqod74')
            .set('Accept', /json/)
            .set('Authorization', updatingLockHeader)
            .send(lockUpdateDetails)
            .then(response => {
              Lock.findOne({ where: { address: lockUpdateDetails.address} }).then((lock) => {
                expect(lock.address).toBe(lockUpdateDetails.address)
                expect(response.statusCode).toBe(202)
                done()
              })
            })
        })
      })
    })

    describe('when the lock does not currently exist', () => {
      test('it returns a 412 status code', done => {
        Date.now = jest.fn(() => 1546467262000)
        request(app)
          .put('/lock/jqfqod74')
          .set('Accept', /json/)
          .set('Authorization', updatingLockHeader)
          .send(lockUpdateDetails)
          .then(response => {
            expect(response.statusCode).toBe(412)
            done()
          })
      })
    })

    describe('when the update requester is not the lock owner', () => {
      test('it returns a 412 status code', done => {
        Date.now = jest.fn(() => 1546467262000)
        Lock.create({
          name: 'a mighty fine lock',
          address: 'jqfqod74',
          owner: '0x423893453',
        }).then(() => {
          request(app)
            .put('/lock/jqfqod74')
            .set('Accept', /json/)
            .set('Authorization', updatingLockHeader)
            .send(lockUpdateDetails)
            .then(response => {
              expect(response.statusCode).toBe(412)
              done()
            })
        })        
      })
    })
  })
})
