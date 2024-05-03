import { merge } from 'lodash'
export const getEventFixture = (event = {}) => {
  return merge(
    {
      data: {
        name: 'An Event',
        image: 'https://host.tld/image.jpg',
        attributes: [
          { trait_type: 'event_start_date', value: '2024-05-22' },
          { trait_type: 'event_start_time', value: '08:30' },
          { trait_type: 'event_end_date', value: '2024-05-22' },
          { trait_type: 'event_end_time', value: '14:00' },
          { trait_type: 'event_timezone', value: 'America/New_York' },
          {
            trait_type: 'event_address',
            value: '29 Little W 12th St, New York, NY 10014, USA',
          },
        ],
        description: 'An Event',
        ticket: {
          event_start_date: '2024-05-22',
          event_start_time: '08:30',
          event_end_date: '2024-05-22',
          event_end_time: '14:00',
          event_timezone: 'America/New_York',
          event_address: '29 Little W 12th St, New York, NY 10014, USA',
        },
        requiresApproval: false,
        emailSender: 'Julien Genestoux',
        replyTo: 'julien@unlock-protocol.com',
      },
      checkoutConfig: { config: { locks: {} } },
    },
    event
  )
}
