const request = require("supertest")
const app = require("../app")
const Lock = require("../sequelize")

beforeAll(() => {
    Lock.create({ name: "Test Lock", address: "0xbac" })
})

afterAll((done) => {
    Lock.truncate()
    done()
})

describe('Requesting lock details', () => {
    describe("when the lock details are available", () => {
        test('it should return the name of the lock', () => {
            return request(app).get('/lock/0xbac').then(response => {
                expect(response.body).toMatchObject({ "name": "Test Lock" })
            })
        })

        test('should return an OK status code', () => {
            return request(app).get('/lock/0xbac').then(response => {
                expect(response.statusCode).toBe(200);
            })
        })
    })

    describe("when the lock details are unavailable", () => {
        test('it should returns an appropriate error code', () => {
            return request(app).get('/lock/0xdeadbeef').then((response) => {
                expect(response.statusCode).toBe(404);
            })
        })
    })

    describe('Setting lock details', () => {
        test("it saves the passed the information", () => {
            return request(app).post('/lock')
                .set('Accept', /json/)
                .send({ address: '0xnewaddress', name: 'creation' }).then((response) => {
                    Lock.findOne({ where: { address: '0xnewaddress' } }).then(record => {
                        expect(record.name).toBe('creation')
                    })
                })
        })

        test("it return a OK status code", () => {
            return request(app).post('/lock').
                send({ address: '0xnewaddress2', name: 'creation2' }).then((response) => {
                    expect(response.statusCode).toBe(200)
                })
            
        })
    })

    describe('Updating lock details', () => {
        describe('when the lock exists', () => {
            test('it updates the lock details', (done) => {
                let update = { address: "0xNewAddress", currentAddress: "0xbac" };
                request(app).put('/lock')
                    .send(update)
                    .then(response => {
                        Lock.findOne({ where: { address: "0xNewAddress" } }).then(record => {
                            expect(response.statusCode).toBe(202)
                            console.log(record)
                        })
                        // expect(response.statusCode).toBe(200)
                    })
                done()
            })
        })

        describe('when the lock does not currently exist', () => {
            return test('it returns a 412 status code', () => {
                request(app).put('/lock')
                    .set('Accept', /json/)
                    .send('{}').then((response) => {
                        expect(response.statusCode).toBe(412)
                    })
            })
        })
    })
})