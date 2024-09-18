import { vi } from 'vitest'

import { CheckoutConfig, EventData, KeyMetadata } from '../../src/models'
import { getEventFixture } from '../../__tests__/fixtures/events'

import {
  createEventSlug,
  getEventBySlug,
  saveEvent,
  getCheckedInAttendees,
} from '../../src/operations/eventOperations'

vi.mock('../../src/operations/wedlocksOperations', () => {
  return {
    sendEmail: vi.fn().mockResolvedValue(true),
  }
})

vi.mock('@unlock-protocol/unlock-js', () => {
  return {
    SubgraphService: vi.fn().mockImplementation(() => {
      return {
        keys: (filter: any, opts: any) => {
          return [
            {
              owner: '0x123',
            },
            {
              owner: '0x456',
            },
          ]
        },
      }
    }),
  }
})

describe('eventOperations', () => {
  beforeEach(async () => {
    await EventData.truncate({ cascade: true })
    await CheckoutConfig.truncate()
    await KeyMetadata.truncate()
  })
  describe('createEventSlug', () => {
    it('should create the event with the correct slug', async () => {
      expect.assertions(2)
      const slug = await createEventSlug('Exclusive event')
      expect(slug).toEqual('exclusive-event')
      await EventData.create({
        name: 'Exclusive event',
        slug,
        data: {},
        createdBy: '0x123',
      })
      const anotherSlug = await createEventSlug('Exclusive event')
      expect(anotherSlug).toEqual('exclusive-event-1')
    })

    it('should create the event with the correct slug without emoji ', async () => {
      expect.assertions(1)
      const slug = await createEventSlug('Exclusive 🔒 party')
      expect(slug).toEqual('exclusive-party')
    })
  })

  describe('saveEvent', () => {
    it('should not override an event if no slug is provided', async () => {
      expect.assertions(2)
      const eventParams = getEventFixture({
        data: { name: 'my party' },
        checkoutConfig: { config: { locks: {} } },
      })
      const [event] = await saveEvent(eventParams, '0x123')
      expect(event.slug).toEqual('my-party')
      const [anotherEvent] = await saveEvent(eventParams, '0x123')
      expect(anotherEvent.slug).toEqual('my-party-1')
    })

    it('should override an event if a slug is provided', async () => {
      expect.assertions(1)
      const eventParams = getEventFixture({
        data: { name: 'my party' },
        checkoutConfig: { config: { locks: {} } },
      })
      const [event] = await saveEvent(eventParams, '0x123')
      const [sameEvent] = await saveEvent(
        {
          data: {
            slug: event.slug,
            name: 'name changed!',
          },
          checkoutConfig: { config: { locks: {} } },
        },
        '0x123'
      )
      expect(sameEvent.slug).toEqual(event.slug)
    })

    it('should not override previously set event data', async () => {
      expect.assertions(6)
      const eventParams = getEventFixture({
        data: {
          name: 'my party',
          requiresApproval: true,
          emailSender: 'Julien Genestoux',
          ticket: {
            event_address: '29 Little W 12th St, New York, NY 10014, USA',
            event_end_date: '2024-05-22',
            event_end_time: '14:00',
            event_timezone: 'America/New_York',
            event_start_date: '2024-05-22',
            event_start_time: '08:30',
          },
        },
        checkoutConfig: { config: { locks: {} } },
      })
      const [event] = await saveEvent(eventParams, '0x123')
      expect(event.data.ticket.event_end_date).toEqual('2024-05-22')
      expect(event.data.ticket.event_address).toEqual(
        '29 Little W 12th St, New York, NY 10014, USA'
      )

      const [sameEvent] = await saveEvent(
        {
          data: {
            slug: event.slug,
            name: 'name changed!',
            ticket: {
              event_address: 'Central Park, New York, NY 10014, USA',
            },
          },
          checkoutConfig: { config: { locks: {} } },
        },
        '0x123'
      )
      expect(sameEvent.slug).toEqual(event.slug)
      expect(sameEvent.name).toEqual('name changed!')
      expect(sameEvent.data.ticket.event_end_date).toEqual('2024-05-22') // unchanged
      expect(sameEvent.data.ticket.event_address).toEqual(
        'Central Park, New York, NY 10014, USA'
      )
    })

    it('should save requiresAppoval when applicable', async () => {
      expect.assertions(2)
      const eventParams = getEventFixture({
        data: {
          name: 'My RSVP party',
          requiresApproval: true,
        },
        checkoutConfig: { config: { locks: {} } },
      })
      const [{ slug }] = await saveEvent(eventParams, '0x123')
      const savedEvent = await getEventBySlug(slug, false)
      expect(savedEvent.slug).toEqual('my-rsvp-party')
      expect(savedEvent?.data.requiresApproval).toEqual(true)
    })

    it('should save a full event with all its data', async () => {
      const eventParams = getEventFixture({
        data: {
          name: 'A unique event!',
        },
        checkoutConfig: {
          name: 'Checkout config for An Event with all the data',
          config: {
            title: 'Registration',
            locks: {
              '0xF174cc512D9aac892cc53330F829028046d0fF6B': {
                network: 11155111,
                metadataInputs: [
                  {
                    name: 'email',
                    type: 'email',
                    label: 'Email address (will receive the ticket)',
                    required: true,
                    placeholder: 'your@email.com',
                    defaultValue: '',
                  },
                  {
                    name: 'fullname',
                    type: 'text',
                    label: 'Full name',
                    required: true,
                    placeholder: 'Satoshi Nakamoto',
                    defaultValue: '',
                  },
                ],
              },
            },
          },
        },
      })
      const [{ slug }] = await saveEvent(eventParams, '0x123')
      const savedEvent = await getEventBySlug(slug, true)
      expect(savedEvent.slug).toEqual('a-unique-event')
      expect(savedEvent?.data).toEqual({
        name: 'A unique event!',
        slug: 'a-unique-event',
        image: 'https://host.tld/image.jpg',
        ticket: {
          event_address: '29 Little W 12th St, New York, NY 10014, USA',
          event_end_date: '2024-05-22',
          event_end_time: '14:00',
          event_timezone: 'America/New_York',
          event_start_date: '2024-05-22',
          event_start_time: '08:30',
        },
        replyTo: 'julien@unlock-protocol.com',
        attributes: [
          { value: '2024-05-22', trait_type: 'event_start_date' },
          { value: '08:30', trait_type: 'event_start_time' },
          { value: '2024-05-22', trait_type: 'event_end_date' },
          { value: '14:00', trait_type: 'event_end_time' },
          { value: 'America/New_York', trait_type: 'event_timezone' },
          {
            value: '29 Little W 12th St, New York, NY 10014, USA',
            trait_type: 'event_address',
          },
        ],
        description: 'An Event',
        emailSender: 'Julien Genestoux',
        requiresApproval: false,
      })

      const savedEventWithoutProtectedData = await getEventBySlug(slug, false)
      expect(savedEventWithoutProtectedData?.data.replyTo).toEqual(undefined)
    })
  })

  describe('getCheckedInAttendees', () => {
    let slug
    beforeEach(async () => {
      const network = 11155111
      const lock = '0xF174cc512D9aac892cc53330F829028046d0fF6B'
      const eventParams = getEventFixture({
        checkoutConfig: {
          config: {
            locks: {
              [lock]: {
                network,
              },
            },
          },
        },
      })
      const [event] = await saveEvent(eventParams, '0x123')
      slug = event.slug
      // And now check in a few attendees, but not all!
      for (let i = 0; i < 10; i++) {
        const metadata: { checkedInAt?: any } = {}
        if (i === 0) {
          metadata.checkedInAt = new Date().toISOString()
        } else if (i === 3) {
          metadata.checkedInAt = [new Date().toISOString()]
        } else if (i === 5) {
          metadata.checkedInAt = [
            { at: new Date().toISOString(), verifierName: 'Verifier A' },
          ]
        } else if (i === 7) {
          metadata.checkedInAt = [
            new Date().toISOString(),
            { at: new Date().toISOString(), verifierName: 'Verifier A' },
          ]
        }

        await KeyMetadata.upsert(
          {
            chain: network,
            address: lock,
            id: (i + 1).toString(),
            data: {
              metadata,
            },
          },
          {
            conflictFields: ['address', 'id'],
          }
        )
      }
    })
    it('should return the list of checked in attendees', async () => {
      const list = await getCheckedInAttendees(slug)

      expect(list).toEqual(['0x123', '0x456'])
    })
  })
})
