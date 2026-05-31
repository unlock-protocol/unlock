import { expect, vi } from 'vitest'
import { EventData } from '../../src/models/Event'
import { EventCollection } from '../../src/models/EventCollection'
import { EventCollectionAssociation } from '../../src/models/EventCollectionAssociation'
import {
  addEventToCollectionOperation,
  addManagerAddressOperation,
  createEventCollectionOperation,
  createEventCollectionSlug,
  getEventCollectionOperation,
  removeManagerAddressOperation,
  updateEventCollectionOperation,
} from '../../src/operations/eventCollectionOperations'
import { EventStatus } from '@unlock-protocol/types'

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

type MockFn = ReturnType<typeof vi.fn>

interface ScopedEventData {
  findOne: MockFn
}

interface MockEventCollection {
  slug?: string
  managerAddresses: string[]
  save?: MockFn
  update?: MockFn
}

interface MockPublicEvent {
  slug: string
  data: Record<string, string>
}

interface MockEvent {
  slug: string
}

const asMock = (fn: unknown) => fn as MockFn

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
    findAll: vi.fn(),
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

vi.mock('../../src/operations/wedlocksOperations', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('../../src/operations/privyUserOperations', () => ({
  getPrivyUserByAddress: vi.fn().mockResolvedValue({ success: false }),
}))

vi.mock('../../src/utils/createSlug', () => ({
  kebabCase: (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
}))

describe('eventCollectionOperations', () => {
  let mockFindOne: ReturnType<typeof vi.fn>
  let scopedEventData: ScopedEventData

  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks before each test

    // Mock the scoped EventData
    mockFindOne = vi.fn()
    scopedEventData = {
      findOne: mockFindOne,
    }
    asMock(EventData.scope).mockReturnValue(scopedEventData)
  })

  describe('createEventCollectionOperation', () => {
    // Verify the creation of an event collection with all provided data
    it('should create an event collection with provided data', async () => {
      const mockSlug = 'test-collection'
      asMock(EventCollection.findByPk).mockResolvedValueOnce(null)
      asMock(EventCollection.create).mockResolvedValueOnce({
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
      asMock(EventCollection.findByPk).mockResolvedValueOnce(null)
      asMock(EventCollection.create).mockResolvedValueOnce({
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
      asMock(EventCollection.findByPk)
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
      asMock(EventCollection.findByPk).mockResolvedValueOnce(null)

      const slug = await createEventCollectionSlug(
        'Test Collection with Spécial Chàracters!'
      )

      expect(slug).toBe('test-collection-with-special-characters')
      expect(EventCollection.findByPk).toHaveBeenCalledWith(
        'test-collection-with-special-characters'
      )
    })

    it('should reserve the public event collection slug', async () => {
      asMock(EventCollection.findByPk).mockResolvedValueOnce(null)

      const slug = await createEventCollectionSlug('All')

      expect(slug).toBe('all-1')
      expect(EventCollection.findByPk).toHaveBeenCalledWith('all-1')
    })
  })

  describe('getEventCollectionOperation', () => {
    it('should return the virtual public event collection for deployed events', async () => {
      const mockEvents: MockPublicEvent[] = [
        {
          slug: 'test-event',
          data: {
            description: 'Public event',
            replyTo: 'private@example.com',
          },
        },
      ]

      asMock(EventData.findAll).mockResolvedValue(mockEvents)

      const result = await getEventCollectionOperation('all')

      expect(EventCollection.findByPk).not.toHaveBeenCalled()
      expect(EventData.findAll).toHaveBeenCalledWith({
        where: {
          eventType: 'unlock',
          status: EventStatus.DEPLOYED,
        },
        order: [['createdAt', 'DESC']],
      })
      expect(result).toMatchObject({
        slug: 'all',
        title: 'Unlock Events',
        managerAddresses: [],
        isVirtual: true,
        events: mockEvents,
      })
      expect(mockEvents[0].data).toEqual({
        description: 'Public event',
      })
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

      asMock(EventCollection.findByPk).mockResolvedValue(mockEventCollection)

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
      asMock(EventCollection.findByPk).mockResolvedValue(null)

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

      asMock(EventCollection.findByPk).mockResolvedValue(mockEventCollection)

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
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
        save: vi.fn().mockResolvedValue(true),
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

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
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

      await expect(
        addManagerAddressOperation('test-collection', '0x456', '0x789')
      ).rejects.toThrow('Not authorized to add managers to this collection')
    })

    // Attempting to add an already existing manager
    it('should throw an error when the manager address already exists', async () => {
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123', '0x456'],
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

      await expect(
        addManagerAddressOperation('test-collection', '0x456', '0x123')
      ).rejects.toThrow('Address is already a manager')
    })

    // Handling scenarios where the event collection does not exist
    it('should throw an error when the event collection does not exist', async () => {
      asMock(EventCollection.findByPk).mockResolvedValue(null)

      await expect(
        addManagerAddressOperation('non-existent', '0x456', '0x123')
      ).rejects.toThrow('Event collection not found')
    })
  })

  describe('removeManagerAddressOperation', () => {
    // Successfully removing an existing manager
    it('should remove an existing manager address from the collection when authorized', async () => {
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123', '0x456'],
        save: vi.fn().mockResolvedValue(true),
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

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
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123', '0x456'],
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

      await expect(
        removeManagerAddressOperation('test-collection', '0x456', '0x789')
      ).rejects.toThrow(
        'Not authorized to remove managers from this collection'
      )
    })

    // Attempting to remove a non-existent manager
    it('should throw an error when the manager address to remove does not exist', async () => {
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

      await expect(
        removeManagerAddressOperation('test-collection', '0x456', '0x123')
      ).rejects.toThrow('Address is not a manager')
    })

    // Preventing the removal of the last remaining manager
    it('should throw an error when attempting to remove the last manager', async () => {
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)

      await expect(
        removeManagerAddressOperation('test-collection', '0x123', '0x123')
      ).rejects.toThrow('Cannot remove the last manager of the collection')
    })

    // Handling scenarios where the event collection does not exist
    it('should throw an error when the event collection does not exist', async () => {
      asMock(EventCollection.findByPk).mockResolvedValue(null)

      await expect(
        removeManagerAddressOperation('non-existent', '0x456', '0x123')
      ).rejects.toThrow('Event collection not found')
    })
  })

  describe('addEventToCollectionOperation', () => {
    // Verify adding an event to the collection
    it('should add an event to the collection', async () => {
      const mockCollection: MockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }
      const mockEvent: MockEvent = { slug: 'test-event' }
      const mockAssociation = { isApproved: true }

      asMock(EventCollection.findByPk).mockResolvedValue(mockCollection)
      mockFindOne.mockResolvedValue(mockEvent)
      asMock(EventCollectionAssociation.findOrCreate).mockResolvedValue([
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
      asMock(EventCollection.findByPk).mockResolvedValue(null)

      await expect(
        addEventToCollectionOperation('non-existent', 'test-event', '0x123')
      ).rejects.toThrow('Collection not found')
    })

    // Verify that an error is thrown when the event is not found
    it('should throw an error when the event is not found', async () => {
      asMock(EventCollection.findByPk).mockResolvedValue({})
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
})
