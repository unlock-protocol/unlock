import axios from 'axios'
import TicketService from '../../services/ticketService'
import UnlockEvent from '../../structured_data/unlockEvent'

jest.mock('axios')

describe('TicketService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const ticketService = new TicketService(serviceHost)

  beforeEach(() => {
    jest.clearAllMocks()
  })
  describe('saveEvent', () => {
    describe('when an event does not exist and can be created', () => {
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
        axios.get.mockReturnValue({ status: 404 })
        axios.post.mockReturnValue({})
        await ticketService.saveEvent(event)

        const payload = UnlockEvent.build(event)

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/events/`,
          payload,
          {}
        )
      })
    })
    describe('when an event does not exist and cannot be created', () => {
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
        axios.get.mockReturnValue({ status: 404 })
        axios.post.mockRejectedValue('Oh dear! An Error')
        try {
          await ticketService.saveEvent(event)
        } catch (error) {
          expect(error).toEqual('Oh dear! An Error')
        }

        const payload = UnlockEvent.build(event)

        expect(axios.post).toHaveBeenCalledWith(
          `${serviceHost}/events/`,
          payload,
          {}
        )
      })
    })
    describe('when an event does exist and can be updated', () => {
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
        axios.get.mockReturnValue({ status: 200 })
        axios.put.mockReturnValue({})
        await ticketService.saveEvent(event)

        const payload = UnlockEvent.build(event)

        expect(axios.put).toHaveBeenCalledWith(
          `${serviceHost}/events/${event.lockAddress}`,
          payload,
          {}
        )
      })
    })
    describe('when an event does exist and cannot be updated', () => {
      it('returns a successful promise', async () => {
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
        axios.get.mockReturnValue({ status: 200 })
        axios.put.mockRejectedValue('Crumbs! An Error')
        try {
          await ticketService.saveEvent(event)
        } catch (error) {
          expect(error).toEqual('Crumbs! An Error')
        }

        const payload = UnlockEvent.build(event)

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
