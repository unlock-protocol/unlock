import { CheckoutConfig, EventData } from '../../src/models'
import {
  createEventSlug,
  saveEvent,
} from '../../src/operations/eventOperations'
describe('eventOperations', () => {
  beforeEach(async () => {
    await EventData.truncate()
    await CheckoutConfig.truncate()
  })
  describe('createEventSlug', () => {
    it('should merge keys items with the corresponding metadata', async () => {
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
  })

  describe('saveEvent', () => {
    it('should not override an event if no slug is provided', async () => {
      expect.assertions(2)
      const eventParams = {
        data: { name: 'my party' },
        checkoutConfig: { config: { locks: {} } },
      }
      const [event] = await saveEvent(eventParams, '0x123')
      expect(event.slug).toEqual('my-party')
      const [anotherEvent] = await saveEvent(eventParams, '0x123')
      expect(anotherEvent.slug).toEqual('my-party-1')
    })

    it('should override an event if a slug is provided', async () => {
      expect.assertions(1)
      const eventParams = {
        data: { name: 'my party' },
        checkoutConfig: { config: { locks: {} } },
      }
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
  })
})
