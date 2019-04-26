import axios from 'axios'
import TicketService from '../../services/ticketService'

jest.mock('axios')

describe('TicketService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const ticketService = new TicketService(serviceHost)

  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('createEvent', () => {
    describe('when the event can be created', () => {
      it('returns a successful promise', async () => {
        expect.assertions(1)
        const event = {
          lockAddress: 'abc123',
          name: 'Sample event',
          description: 'Fun times',
          location: 'On the blockchain',
          date: new Date().toString(),
          owner: '0x03',
          logo: '',
        }
        axios.post.mockReturnValue({})
        await ticketService.createEvent(event)

        const payload = {
          message: {
            event,
          },
        }

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/events/`,
          payload,
          {}
        )
      })
    })
    describe('when the event cannot be created', () => {
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        const event = {
          lockAddress: 'abc123',
          name: 'Sample event',
          description: 'Fun times',
          location: 'On the blockchain',
          date: new Date().toString(),
          owner: '0x03',
          logo: '',
        }
        axios.post.mockRejectedValue('Hark! An Error')
        try {
          await ticketService.createEvent(event)
        } catch (error) {
          expect(error).toEqual('Hark! An Error')
        }

        const payload = {
          message: {
            event,
          },
        }

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/events/`,
          payload,
          {}
        )
      })
    })
  })
  describe('updateEvent', () => {
    describe('when the event can be updated', () => {
      it('returns a successful promise', async () => {
        expect.assertions(1)
        const event = {
          lockAddress: 'abc123',
          name: 'Sample event',
          description: 'Fun times',
          location: 'On the blockchain',
          date: new Date().toString(),
          owner: '0x03',
          logo: '',
        }
        axios.put.mockReturnValue({})
        await ticketService.updateEvent(event)

        const payload = {
          message: {
            event,
          },
        }

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/events/${event.lockAddress}`,
          payload,
          {}
        )
      })
    })
    describe('when the event cannot be created', () => {
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        const event = {
          lockAddress: 'abc123',
          name: 'Sample event',
          description: 'Fun times',
          location: 'On the blockchain',
          date: new Date().toString(),
          owner: '0x03',
          logo: '',
        }
        axios.put.mockRejectedValue('Hark! An Error')
        try {
          await ticketService.updateEvent(event)
        } catch (error) {
          expect(error).toEqual('Hark! An Error')
        }

        const payload = {
          message: {
            event,
          },
        }

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/events/${event.lockAddress}`,
          payload,
          {}
        )
      })
    })
  })
  describe('getEvent', () => {
    describe('when an event can be retrieved', () => {
      it('returns a successful promise', async () => {
        expect.assertions(1)
        const eventAddress = 'abc123'
        axios.get.mockReturnValue({})
        await ticketService.getEvent(eventAddress)

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/events/${eventAddress}`
        )
      })
    })
    describe('when an event cannot be retrieved', () => {
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        const eventAddress = 'abc123'
        axios.get.mockRejectedValue('Egads! An Error')

        try {
          await ticketService.getEvent(eventAddress)
        } catch (error) {
          expect(error).toEqual('Egads! An Error')
        }

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/events/${eventAddress}`
        )
      })
    })
  })
})
