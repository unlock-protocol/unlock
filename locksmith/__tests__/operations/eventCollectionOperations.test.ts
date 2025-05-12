import { expect, vi } from 'vitest'
import { EventData } from '../../src/models/Event'
import { EventCollection } from '../../src/models/EventCollection'
import { EventCollectionAssociation } from '../../src/models/EventCollectionAssociation'
import {
  addEventToCollectionOperation,
  addManagerAddressOperation,
  createEventCollectionOperation,
  createEventCollectionSlug,
  removeManagerAddressOperation,
  updateEventCollectionOperation,
} from '../../src/operations/eventCollectionOperations'
import EventCollectionOperations from '../../src/operations/eventCollectionOperations'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { sendEmail } from '../../src/operations/wedlocksOperations'
import { getPrivyUserByAddress } from '../../src/operations/privyUserOperations'
import { getMetadata } from '../../src/operations/userMetadataOperations'

// interface for link types
interface Link {
  type: 'website' | 'farcaster' | 'x' | 'github' | 'youtube'
  url: string
}

// interface for the updated event collection data
interface UpdatedEventCollectionData {
  title: string
  description: string
  coverImage?: string
  banner?: string
  links?: Link[]
  managerAddresses: string[]
}

// Mocks necessary models and utilities
vi.mock('../../src/models/EventCollection', () => ({
  EventCollection: {
    findByPk: vi.fn(),
    create: vi.fn(),
    belongsToMany: vi.fn(),
  },
}))

vi.mock('../../src/models/Event', () => ({
  EventData: {
    scope: vi.fn(),
    belongsToMany: vi.fn(),
    findOne: vi.fn(),
  },
}))

vi.mock('../../src/models/EventCollectionAssociation', () => ({
  EventCollectionAssociation: {
    findOrCreate: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    belongsTo: vi.fn(),
  },
}))

vi.mock('../../src/utils/createSlug', () => ({
  kebabCase: (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
}))

// Mock external dependencies
vi.mock('@unlock-protocol/unlock-js', () => ({
  SubgraphService: vi.fn().mockImplementation(() => ({
    keys: () => [
      { owner: '0x123', expired: false },
      { owner: '0x456', expired: false },
    ],
  })),
}))

vi.mock('../../src/operations/userMetadataOperations', () => ({
  getMetadata: vi.fn().mockImplementation((params) => {
    if (params.userAddress === '0x123') {
      return {
        email: 'user1@example.com',
        fullname: 'User One',
      }
    }
    if (params.userAddress === '0x456') {
      return {
        email: 'user2@example.com',
        public: { fullname: 'User Two' },
      }
    }
    return null
  }),
}))

vi.mock('../../src/operations/wedlocksOperations', () => ({
  sendEmail: vi.fn().mockImplementation((emailData) => {
    console.log('Email sent:', emailData)
  }),
}))

// Add mock for privy user operations
vi.mock('../../src/operations/privyUserOperations', () => ({
  getPrivyUserByAddress: vi.fn().mockImplementation(async (address) => {
    if (address === '0xSubmitter') {
      return {
        success: true,
        user: {
          email: { address: 'submitter@example.com' },
        },
      }
    }
    return { success: false, user: null }
  }),
}))

describe('eventCollectionOperations', () => {
  let mockFindOne: ReturnType<typeof vi.fn>
  let scopedEventData: any

  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks before each test

    // Re-apply global mocks needed by multiple tests after reset
    vi.mocked(SubgraphService).mockImplementation(
      () =>
        ({
          keys: vi.fn().mockResolvedValue([
            { owner: '0x123', expired: false },
            { owner: '0x456', expired: false },
          ]),
          locks: vi.fn(),
          key: vi.fn(),
          keyHolders: vi.fn(),
          lock: vi.fn(),
          // Add other necessary methods if needed, or cast to bypass strict type checking
        }) as unknown as SubgraphService
    )

    vi.mocked(getMetadata).mockImplementation(
      async (_tokenAddress, userAddress) => {
        if (userAddress === '0x123') {
          return {
            email: 'user1@example.com',
            fullname: 'User One',
          }
        }
        if (userAddress === '0x456') {
          return {
            email: 'user2@example.com',
            public: { fullname: 'User Two' }, // Assuming public is nested
          }
        }
        return null
      }
    )

    // Mock the scoped EventData
    mockFindOne = vi.fn()
    scopedEventData = {
      findOne: mockFindOne,
    }
    ;(EventData.scope as any).mockReturnValue(scopedEventData)

    // Mock getPrivyUserByAddress
    vi.mocked(getPrivyUserByAddress).mockImplementation(async (address) => {
      if (address === '0xSubmitter') {
        return {
          success: true,
          user: { email: { address: 'submitter@example.com' } },
        }
      }
      return { success: false, user: null }
    })
  })

  describe('createEventCollectionOperation', () => {
    // Verify the creation of an event collection with all provided data
    it('should create an event collection with provided data', async () => {
      const mockSlug = 'test-collection'
      ;(EventCollection.findByPk as any).mockResolvedValueOnce(null)
      ;(EventCollection.create as any).mockResolvedValueOnce({
        slug: mockSlug,
        title: 'Test Collection',
        description: 'A test collection',
        coverImage: 'https://example.com/cover.jpg',
        banner: 'https://example.com/banner.jpg',
        links: [{ type: 'website', url: 'https://example.com' }],
        managerAddresses: ['0x123'],
        events: [],
      })

      const creatorAddress = '0x123'
      const result = await createEventCollectionOperation(
        {
          title: 'Test Collection',
          description: 'A test collection',
          coverImage: 'https://example.com/cover.jpg',
          banner: 'https://example.com/banner.jpg',
          links: [{ type: 'website', url: 'https://example.com' }],
          managerAddresses: [],
        },
        creatorAddress
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith(mockSlug)
      expect(EventCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: mockSlug,
          title: 'Test Collection',
          description: 'A test collection',
          coverImage: 'https://example.com/cover.jpg',
          banner: 'https://example.com/banner.jpg',
          links: [{ type: 'website', url: 'https://example.com' }],
          managerAddresses: ['0x123'],
        })
      )
      expect(result).toEqual({
        slug: mockSlug,
        title: 'Test Collection',
        description: 'A test collection',
        coverImage: 'https://example.com/cover.jpg',
        banner: 'https://example.com/banner.jpg',
        links: [{ type: 'website', url: 'https://example.com' }],
        managerAddresses: ['0x123'],
        events: [],
      })
    })

    // Verify the behavior when manager addresses are provided vs. when they are not
    it('should use provided manager addresses and include creator address', async () => {
      const mockSlug = 'test-collection'
      ;(EventCollection.findByPk as any).mockResolvedValueOnce(null)
      ;(EventCollection.create as any).mockResolvedValueOnce({
        slug: mockSlug,
        managerAddresses: ['0x456', '0x789', '0x123'],
      })

      const creatorAddress = '0x123'
      const result = await createEventCollectionOperation(
        {
          title: 'Test Collection',
          description: 'A test collection',
          coverImage: 'https://example.com/cover.jpg',
          banner: 'https://example.com/banner.jpg',
          links: [{ type: 'website', url: 'https://example.com' }],
          managerAddresses: ['0x456', '0x789'],
        },
        creatorAddress
      )

      // Assertions
      expect(EventCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: mockSlug,
          managerAddresses: expect.arrayContaining(['0x456', '0x789', '0x123']),
          coverImage: 'https://example.com/cover.jpg',
          banner: 'https://example.com/banner.jpg',
          links: [{ type: 'website', url: 'https://example.com' }],
        })
      )
      expect(result.managerAddresses).toEqual(['0x456', '0x789', '0x123'])
    })
  })

  describe('createEventCollectionSlug', () => {
    it('should create a unique slug', async () => {
      ;(EventCollection.findByPk as any)
        .mockResolvedValueOnce({}) // First call returns an existing collection
        .mockResolvedValueOnce(null) // Second call returns null (unique slug)

      const slug = await createEventCollectionSlug('Test Collection')

      expect(slug).toBe('test-collection-1')
      expect(EventCollection.findByPk).toHaveBeenCalledTimes(2)
      expect(EventCollection.findByPk).toHaveBeenNthCalledWith(
        1,
        'test-collection'
      )
      expect(EventCollection.findByPk).toHaveBeenNthCalledWith(
        2,
        'test-collection-1'
      )
    })

    it('should handle special characters', async () => {
      ;(EventCollection.findByPk as any).mockResolvedValueOnce(null)

      const slug = await createEventCollectionSlug(
        'Test Collection with Spécial Chàracters!'
      )

      expect(slug).toBe('test-collection-with-special-characters')
      expect(EventCollection.findByPk).toHaveBeenCalledWith(
        'test-collection-with-special-characters'
      )
    })
  })

  describe('updateEventCollectionOperation', () => {
    // Verify updating an event collection when authorized
    it('should update an event collection when authorized', async () => {
      const mockSlug = 'test-collection'
      const mockEventCollection = {
        slug: mockSlug,
        title: 'Old Title',
        description: 'Old Description',
        coverImage: 'https://example.com/old-cover.jpg',
        banner: 'https://example.com/old-banner.jpg',
        links: [{ type: 'website', url: 'https://example.com/old' }],
        managerAddresses: ['0x123'],
        update: vi.fn(),
      }

      ;(EventCollection.findByPk as any).mockResolvedValue(mockEventCollection)

      const updatedData: UpdatedEventCollectionData = {
        title: 'New Title',
        description: 'New Description',
        coverImage: 'https://example.com/new-cover.jpg',
        banner: 'https://example.com/new-banner.jpg',
        links: [{ type: 'website', url: 'https://example.com/new' }],
        managerAddresses: ['0x123', '0x456'],
      }

      await updateEventCollectionOperation(mockSlug, updatedData, '0x123')

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith(mockSlug)
      expect(mockEventCollection.update).toHaveBeenCalledWith(updatedData)
    })

    // Verify that an error is thrown when the collection is not found
    it('should throw an error when the collection is not found', async () => {
      ;(EventCollection.findByPk as any).mockResolvedValue(null)

      await expect(
        updateEventCollectionOperation(
          'non-existent',
          {} as UpdatedEventCollectionData,
          '0x123'
        )
      ).rejects.toThrow('Event collection not found')
    })

    // Verify that an error is thrown when the user is not authorized
    it('should throw an error when the user is not authorized', async () => {
      const mockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }

      ;(EventCollection.findByPk as any).mockResolvedValue(mockEventCollection)

      await expect(
        updateEventCollectionOperation(
          'test-collection',
          {} as UpdatedEventCollectionData,
          '0x456'
        )
      ).rejects.toThrow('Not authorized to update this collection')
    })
  })

  describe('addManagerAddressOperation', () => {
    // Successfully adding a new manager
    it('should add a new manager address to the collection when authorized', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
        save: vi.fn().mockResolvedValue(true),
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      const result = await addManagerAddressOperation(
        'test-collection',
        '0x456',
        '0x123'
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith('test-collection')
      expect(mockCollection.managerAddresses).toContain('0x456')
      expect(mockCollection.save).toHaveBeenCalled()
      expect(result).toBe(mockCollection)
    })

    // Attempting to add a manager when not authorized
    it('should throw an error when the requester is not authorized to add managers', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      await expect(
        addManagerAddressOperation('test-collection', '0x456', '0x789')
      ).rejects.toThrow('Not authorized to add managers to this collection')
    })

    // Attempting to add an already existing manager
    it('should throw an error when the manager address already exists', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123', '0x456'],
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      await expect(
        addManagerAddressOperation('test-collection', '0x456', '0x123')
      ).rejects.toThrow('Address is already a manager')
    })

    // Handling scenarios where the event collection does not exist
    it('should throw an error when the event collection does not exist', async () => {
      ;(EventCollection.findByPk as any).mockResolvedValue(null)

      await expect(
        addManagerAddressOperation('non-existent', '0x456', '0x123')
      ).rejects.toThrow('Event collection not found')
    })
  })

  describe('removeManagerAddressOperation', () => {
    // Successfully removing an existing manager
    it('should remove an existing manager address from the collection when authorized', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123', '0x456'],
        save: vi.fn().mockResolvedValue(true),
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      const result = await removeManagerAddressOperation(
        'test-collection',
        '0x456',
        '0x123'
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith('test-collection')
      expect(mockCollection.managerAddresses).not.toContain('0x456')
      expect(mockCollection.save).toHaveBeenCalled()
      expect(result).toBe(mockCollection)
    })

    // Attempting to remove a manager when not authorized
    it('should throw an error when the requester is not authorized to remove managers', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123', '0x456'],
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      await expect(
        removeManagerAddressOperation('test-collection', '0x456', '0x789')
      ).rejects.toThrow(
        'Not authorized to remove managers from this collection'
      )
    })

    // Attempting to remove a non-existent manager
    it('should throw an error when the manager address to remove does not exist', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      await expect(
        removeManagerAddressOperation('test-collection', '0x456', '0x123')
      ).rejects.toThrow('Address is not a manager')
    })

    // Preventing the removal of the last remaining manager
    it('should throw an error when attempting to remove the last manager', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      } as any

      ;(EventCollection.findByPk as any).mockResolvedValue(mockCollection)

      await expect(
        removeManagerAddressOperation('test-collection', '0x123', '0x123')
      ).rejects.toThrow('Cannot remove the last manager of the collection')
    })

    // Handling scenarios where the event collection does not exist
    it('should throw an error when the event collection does not exist', async () => {
      ;(EventCollection.findByPk as any).mockResolvedValue(null)

      await expect(
        removeManagerAddressOperation('non-existent', '0x456', '0x123')
      ).rejects.toThrow('Event collection not found')
    })
  })

  describe('addEventToCollectionOperation', () => {
    // Verify adding an event to the collection
    it('should add an event to the collection', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }
      const mockEvent = { slug: 'test-event' }
      const mockAssociation = { isApproved: true }

      ;(EventCollection.findByPk as any).mockResolvedValue(
        mockCollection as any
      )
      mockFindOne.mockResolvedValue(mockEvent as any)
      ;(EventCollectionAssociation.findOrCreate as any).mockResolvedValue([
        mockAssociation,
        true,
      ])

      const result = await addEventToCollectionOperation(
        'test-collection',
        'test-event',
        '0x123'
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith('test-collection')
      expect(EventData.scope).toHaveBeenCalledWith('withoutId')
      expect(mockFindOne).toHaveBeenCalledWith({
        where: { slug: 'test-event' },
      })
      expect(EventCollectionAssociation.findOrCreate).toHaveBeenCalledWith({
        where: { eventSlug: 'test-event', collectionSlug: 'test-collection' },
        defaults: {
          eventSlug: 'test-event',
          collectionSlug: 'test-collection',
          isApproved: true,
          submitterAddress: '0x123',
        },
      })
      expect(result).toEqual({
        status: 'approved and added',
        association: mockAssociation,
      })
    })

    // Verify that an error is thrown when the collection is not found
    it('should throw an error when the collection is not found', async () => {
      ;(EventCollection.findByPk as any).mockResolvedValue(null)

      await expect(
        addEventToCollectionOperation('non-existent', 'test-event', '0x123')
      ).rejects.toThrow('Collection not found')
    })

    // Verify that an error is thrown when the event is not found
    it('should throw an error when the event is not found', async () => {
      ;(EventCollection.findByPk as any).mockResolvedValue({} as any)
      mockFindOne.mockResolvedValue(null)

      await expect(
        addEventToCollectionOperation(
          'test-collection',
          'non-existent',
          '0x123'
        )
      ).rejects.toThrow('Event not found')
    })
  })

  describe('getKeyHoldersForLock', () => {
    it('should return attendees with email addresses', async () => {
      expect.assertions(3)
      const attendees = await EventCollectionOperations.getKeyHoldersForLock(
        '0xLockAddress',
        1
      )

      expect(attendees.length).toBe(2)
      expect(attendees[0]).toEqual({
        owner: '0x123',
        email: 'user1@example.com',
        name: 'User One',
      })
      expect(attendees[1]).toEqual({
        owner: '0x456',
        email: 'user2@example.com',
        name: 'User Two',
      })
    })

    it('should handle errors gracefully', async () => {
      expect.assertions(1)
      // Provide a more complete mock for SubgraphService to satisfy types
      const mockSubgraphService = {
        keys: vi.fn().mockRejectedValue(new Error('Subgraph error')),
        // Add other necessary methods if the function uses them
        locks: vi.fn(),
        key: vi.fn(),
        keyHolders: vi.fn(),
        lock: vi.fn(),
        // ... add other methods as needed based on SubgraphService type
      } as unknown as SubgraphService // Cast to bypass strict type checking in mock

      vi.mocked(SubgraphService).mockImplementationOnce(
        () => mockSubgraphService
      )

      const attendees = await EventCollectionOperations.getKeyHoldersForLock(
        '0xLockAddress',
        1
      )
      expect(attendees).toEqual([])
    })
  })

  describe('approveEventOperation', () => {
    const mockCollection = {
      slug: 'test-collection',
      title: 'Test Collection',
      managerAddresses: ['0xManager'],
    }

    const mockEvent = {
      slug: 'test-event',
      name: 'Test Event',
      data: {
        startDate: '2024-03-20',
        ticket: {
          event_address: '0xLockAddress',
          network: 1,
        },
      },
    }

    beforeEach(() => {
      EventCollection.findByPk = vi.fn().mockResolvedValue(mockCollection)
      EventData.findOne = vi.fn().mockResolvedValue(mockEvent)
      EventCollectionAssociation.findOne = vi.fn().mockResolvedValue({
        eventSlug: 'test-event',
        collectionSlug: 'test-collection',
        submitterAddress: '0xSubmitter',
        update: vi.fn(),
      })
      // Mock findAll to return a different approved event for past attendee check
      EventCollectionAssociation.findAll = vi.fn().mockResolvedValue([
        {
          eventSlug: 'past-event',
          collectionSlug: 'test-collection',
          isApproved: true,
        },
      ])
      // Mock EventData.findOne for the past event's details
      vi.mocked(EventData.findOne).mockImplementation(async (options) => {
        // Cast where to any to access slug directly
        const slug = (options?.where as any)?.slug

        if (slug === 'test-event') {
          return mockEvent as any // Cast mock return
        }
        if (slug === 'past-event') {
          return {
            slug: 'past-event',
            name: 'Past Event',
            data: {
              ticket: {
                event_address: '0xPastLockAddress',
                network: 1,
              },
            },
          } as any // Cast mock return
        }
        return null
      })
    })

    it('should approve event and send notifications', async () => {
      expect.assertions(2)

      await EventCollectionOperations.approveEventOperation(
        'test-collection',
        'test-event',
        '0xManager',
        true
      )

      // Should send email to submitter
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'eventApprovedInCollection',
          recipient: expect.any(String),
        })
      )

      // Should send emails to past attendees
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'newEventInCollection',
          recipient: expect.any(String),
        })
      )
    })

    it('should reject unauthorized approvals', async () => {
      expect.assertions(1)

      await expect(
        EventCollectionOperations.approveEventOperation(
          'test-collection',
          'test-event',
          '0xUnauthorized',
          true
        )
      ).rejects.toThrow('Not authorized to approve events')
    })
  })

  describe('bulkApproveEventsOperation', () => {
    const mockCollection = {
      slug: 'test-collection',
      title: 'Test Collection',
      managerAddresses: ['0xManager'],
    }

    const mockEvents = [
      {
        slug: 'event-1',
        name: 'Event One',
        data: {
          startDate: '2024-03-20',
          ticket: {
            event_address: '0xLockAddress1',
            network: 1,
          },
        },
      },
      {
        slug: 'event-2',
        name: 'Event Two',
        data: {
          startDate: '2024-03-21',
          ticket: {
            event_address: '0xLockAddress2',
            network: 1,
          },
        },
      },
    ]

    beforeEach(() => {
      EventCollection.findByPk = vi.fn().mockResolvedValue(mockCollection)
      // Mock EventData.findAll for the events being approved
      EventData.findAll = vi.fn().mockResolvedValue(mockEvents)

      // Mock EventCollectionAssociation.findAll
      vi.mocked(EventCollectionAssociation.findAll)
        // First call: return associations being approved
        .mockResolvedValueOnce(
          mockEvents.map(
            (event) =>
              ({
                eventSlug: event.slug,
                collectionSlug: 'test-collection',
                submitterAddress: '0xSubmitter',
                isApproved: false, // Before approval
                save: vi.fn(),
              } as any) // Correct parenthesis placement
          )
        )
        // Second call (for past attendees): return a different approved event
        .mockResolvedValue([
          {
            eventSlug: 'past-event-bulk',
            collectionSlug: 'test-collection',
            isApproved: true,
          } as any, // Cast mock return
        ])

      // Mock EventData.findOne for the past event's details in bulk op
      vi.mocked(EventData.findOne).mockImplementation(async (options) => {
        // Cast where to any to access slug directly
        const slug = (options?.where as any)?.slug

        if (slug === 'past-event-bulk') {
          return {
            slug: 'past-event-bulk',
            name: 'Past Event Bulk',
            data: {
              ticket: {
                event_address: '0xPastLockAddressBulk',
                network: 1,
              },
            },
          } as any // Cast mock return
        }
        return null // Important for other findOne calls
      })
    })

    it('should bulk approve events and send notifications efficiently', async () => {
      expect.assertions(3)
      // Re-apply privy mock specific to this context if needed (already global)
      // vi.mocked(getPrivyUserByAddress).mockResolvedValue({ ... });

      await EventCollectionOperations.bulkApproveEventsOperation(
        'test-collection',
        ['event-1', 'event-2'],
        '0xManager',
        true
      )

      // Should send emails to submitters
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'eventApprovedInCollection',
          recipient: expect.any(String),
        })
      )

      // Should send emails to past attendees
      expect(sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          template: 'newEventInCollection',
          recipient: expect.any(String),
        })
      )

      // Should avoid duplicate notifications
      const uniqueRecipients = new Set(
        vi
          .mocked(sendEmail)
          .mock.calls.filter(
            (call) => call[0].template === 'newEventInCollection'
          )
          .map((call) => call[0].recipient)
      )
      expect(uniqueRecipients.size).toBeLessThanOrEqual(2) // Only our two mock attendees
    })

    it('should handle empty event list gracefully', async () => {
      expect.assertions(1)

      EventCollectionAssociation.findAll = vi.fn().mockResolvedValue([])

      await expect(
        EventCollectionOperations.bulkApproveEventsOperation(
          'test-collection',
          [],
          '0xManager',
          true
        )
      ).rejects.toThrow('No events to approve')
    })
  })
})
