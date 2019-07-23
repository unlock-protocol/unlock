import axios from 'axios'
import EventService from '../../services/eventService'
import UnlockEvent from '../../structured_data/unlockEvent'

jest.mock('axios')

describe('EventService', () => {
  const serviceHost = 'http://127.0.0.1:8080'
  const eventService = new EventService(serviceHost)

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
        await eventService.saveEvent(event)

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
          await eventService.saveEvent(event)
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
        await eventService.saveEvent(event)

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
          await eventService.saveEvent(event)
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
        expect.assertions(2)
        const eventAddress = 'abc123'
        const date = new Date(2019, 7, 4, 6, 11, 30)
        const name = 'My Party'
        const description = 'The fancy party'
        const location = 'The block'
        const duration = 60 * 60 * 3
        const links = {
          href: 'https://party.com',
          text: 'Event website',
        }
        const logo = 'mylogo'
        const image = 'myimage'

        axios.get.mockReturnValue({
          data: {
            name,
            date,
            description,
            location,
            duration,
            logo,
            image,
            eventLinks: links,
          },
        })
        const event = await eventService.getEvent(eventAddress)

        expect(axios.get).toHaveBeenCalledWith(
          `${serviceHost}/events/${eventAddress}`
        )
        expect(event).toEqual({
          date,
          name,
          description,
          location,
          links,
          duration,
          image,
          lockAddress: eventAddress,
          logo,
        })
      })
    })

    describe('when an event cannot be retrieved', () => {
      it('returns a rejected promise', async () => {
        expect.assertions(2)
        const eventAddress = 'abc123'
        axios.get.mockRejectedValue('Egads! An Error')

        try {
          await eventService.getEvent(eventAddress)
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
