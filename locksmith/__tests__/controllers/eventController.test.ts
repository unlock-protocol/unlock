import * as sigUtil from 'eth-sig-util'
import * as ethJsUtil from 'ethereumjs-util'

const request = require('supertest')
const app = require('../../src/app')
const Base64 = require('../../src/utils/base64')
const models = require('../../src/models')

let Event = models.Event

let newLinks = {
  eventModification: {
    lockAddress: '0x49158d35259e3264ad2a6abb300cda19294d125e',
    owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
  },
  eventLinks: [
    {
      text: 'a link',
      href: 'https://www.example.com',
    },
    {
      text: 'another link',
      href: 'https://www.msn.com',
    },
  ],
}

let message = {
  event: {
    lockAddress: '0x49158d35259e3264ad2a6abb300cda19294d125e',
    name: 'A Test Event',
    description: 'A fun event for everyone',
    location: 'http://example.com/a_sample_location',
    date: 1744487946000,
    logo: 'http://example.com/a_logo',
    owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
    duration: 42,
    links: newLinks,
  },
}

let badOwnerMessage = {
  event: {
    lockAddress: '0x49158d35259e3264ad2a6abb300cda19294d125e',
    name: 'A Test Event',
    description: 'A fun event for everyone',
    location: 'http://example.com/a_sample_location',
    date: 1744487946000,
    logo: 'http://example.com/a_logo',
    owner: '0xbbbcdde4c0b861cb36f4ce006a9c90ba2e43abc9',
  },
}

let overWritingLinks = {
  eventModification: {
    lockAddress: '0x49158d35259e3264ad2a6abb300cda19294d125e',
    owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
  },
  eventLinks: [
    {
      text: 'link 3 ',
      href: 'https://www.example-3.com',
    },
    {
      text: 'link 4',
      href: 'https://www.example-4.com',
    },
    {
      text: 'link 5',
      href: 'https://www.example-5.com',
    },
  ],
}

let privateKey = ethJsUtil.toBuffer(
  '0xfd8abdd241b9e7679e3ef88f05b31545816d6fbcaf11e86ebd5a57ba281ce229'
)

function generateTypedData(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      Event: [
        { name: 'lockAddress', type: 'address' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string' },
        { name: 'location', type: 'string' },
        { name: 'date', type: 'uint64' },
        { name: 'logo', type: 'string' },
        { name: 'duration', type: 'uint64' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'Event',
    message: message,
  }
}

function generateTypedData2(message: any) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
        { name: 'salt', type: 'bytes32' },
      ],
      EventModification: [
        { name: 'lockAddress', type: 'address' },
        { name: 'owner', type: 'address' },
      ],
    },
    domain: {
      name: 'Unlock',
      version: '1',
    },
    primaryType: 'EventModification',
    message: message,
  }
}

beforeAll(async () => {
  await Event.truncate({ cascade: true })
})

describe('Event Controller', () => {
  describe('event creation', () => {
    describe('when unaccompanied by a valid signature', () => {
      it('does not create an event and returns 401', async () => {
        expect.assertions(2)
        let typedData = generateTypedData(message)

        let response = await request(app)
          .post('/events')
          .set('Accept', /json/)
          .send(typedData)

        expect(response.status).toBe(401)
        expect(await Event.count()).toEqual(0)
      })
    })

    describe('when the event could be created', () => {
      it('creates the event and returns 200', async () => {
        expect.assertions(1)
        let typedData = generateTypedData(message)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .post('/events')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(200)
      })
    })

    describe('when the event could not be created', () => {
      it('returns a 409 status code', async () => {
        expect.assertions(1)
        let typedData = generateTypedData(message)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .post('/events')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(409)
      })
    })
  })
  describe('event update', () => {
    describe('when unaccompanied by a valid signature', () => {
      it('does not save an event and returns 401', async () => {
        expect.assertions(1)
        let typedData = generateTypedData(message)

        let response = await request(app)
          .put('/events/0x49158d35259E3264Ad2a6aBb300cdA19294D125e')
          .set('Accept', /json/)
          .send(typedData)

        expect(response.status).toBe(401)
      })
    })
    describe('when the event could be saved', () => {
      it('updates the event and returns 200', async () => {
        expect.assertions(1)
        let typedData = generateTypedData(message)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put('/events/0x49158d35259E3264Ad2a6aBb300cdA19294D125e')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(202)
      })
    })
    describe('when there is an owner mismatch', () => {
      it('does not save the event and returns 401', async () => {
        expect.assertions(1)
        let typedData = generateTypedData(badOwnerMessage)
        const sig = sigUtil.signTypedData(privateKey, {
          data: typedData,
          from: '',
        })

        let response = await request(app)
          .put('/events/0x49158d35259E3264Ad2a6aBb300cdA19294D125e')
          .set('Accept', /json/)
          .set('Authorization', `Bearer ${Base64.encode(sig)}`)
          .send(typedData)

        expect(response.status).toBe(401)
      })
    })
  })

  describe('when the event does not exist', () => {
    it('returns a 404 status code', async () => {
      expect.assertions(1)
      let response = await request(app).get(
        '/events/0xAc442c26177a33B255E811Ea2736234bCB4bCf96'
      )
      expect(response.status).toBe(404)
    })
  })
})

describe('adding event links', () => {
  it('stores the link attached to the event', async () => {
    expect.assertions(1)
    let typedData = generateTypedData2(newLinks)
    const sig = sigUtil.signTypedData(privateKey, {
      data: typedData,
      from: '',
    })

    let response = await request(app)
      .post('/events/0x49158d35259e3264ad2a6abb300cda19294d125e/links')
      .set('Accept', /json/)
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .send(typedData)

    expect(response.status).toBe(202)
  })
})

describe('overwritting event links', () => {
  it('stores the link attached to the event', async () => {
    expect.assertions(1)

    let typedData = generateTypedData(overWritingLinks)
    const sig = sigUtil.signTypedData(privateKey, {
      data: typedData,
      from: '',
    })

    let response = await request(app)
      .post('/events/0x49158d35259e3264ad2a6abb300cda19294d125e/links')
      .set('Accept', /json/)
      .set('Authorization', `Bearer ${Base64.encode(sig)}`)
      .send(typedData)

    expect(response.status).toBe(202)
  })
})

describe('event request', () => {
  describe('when the event exists', () => {
    it('returns the event', async () => {
      expect.assertions(3)
      let response = await request(app).get(
        '/events/0x49158d35259E3264Ad2a6aBb300cdA19294D125e'
      )

      expect(response.body.eventLinks.length).not.toEqual(0)
      expect(response.status).toBe(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          createdAt: expect.any(String),
          date: '2025-04-12T19:59:06.000Z',
          description: 'A fun event for everyone',
          id: expect.any(Number),
          location: 'http://example.com/a_sample_location',
          lockAddress: '0x49158d35259E3264Ad2a6aBb300cdA19294D125e',
          logo: 'http://example.com/a_logo',
          name: 'A Test Event',
          updatedAt: expect.any(String),
          eventLinks: expect.any(Array),
        })
      )
    })
  })
})
