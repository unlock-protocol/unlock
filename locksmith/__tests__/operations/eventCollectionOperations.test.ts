import { expect, vi } from 'vitest'
import { EventData } from '../../src/models/Event'
import { EventCollection } from '../../src/models/EventCollection'
import { EventCollectionAssociation } from '../../src/models/EventCollectionAssociation'
import {
  addEventToCollectionOperation,
  createEventCollectionOperation,
  createEventCollectionSlug,
  getEventCollectionOperation,
  getEventsInCollectionOperation,
  updateEventCollectionOperation,
} from '../../src/operations/eventCollectionOperations'

// Mocks necessary models and utilities
vi.mock('../../src/models/EventCollection')
vi.mock('../../src/models/Event')
vi.mock('../../src/models/EventCollectionAssociation')
vi.mock('../../src/utils/createSlug')

describe('eventCollectionOperations', () => {
  beforeEach(() => {
    vi.resetAllMocks() // Reset mocks before each test
  })

  describe('createEventCollectionOperation', () => {
    // Verify the creation of an event collection with all provided data
    it('should create an event collection with provided data', async () => {
      const mockSlug = 'test-collection'
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValueOnce(null)
      vi.spyOn(EventCollection, 'create').mockResolvedValueOnce({
        slug: mockSlug,
        title: 'Test Collection',
        description: 'A test collection',
        banner: 'https://example.com/banner.jpg',
        links: { website: 'https://example.com' },
        managerAddresses: ['0x123'],
        events: [],
      } as any)

      const creatorAddress = '0x123'
      const result = await createEventCollectionOperation(
        {
          title: 'Test Collection',
          description: 'A test collection',
          banner: 'https://example.com/banner.jpg',
          links: [{ name: 'website', url: 'https://example.com' }],
          managerAddresses: [],
        },
        creatorAddress
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith('test-collection')
      expect(EventCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-collection',
          title: 'Test Collection',
          description: 'A test collection',
          banner: 'https://example.com/banner.jpg',
          links: { website: 'https://example.com' },
          managerAddresses: ['0x123'],
        })
      )
      expect(result).toEqual({
        slug: mockSlug,
        title: 'Test Collection',
        description: 'A test collection',
        banner: 'https://example.com/banner.jpg',
        links: { website: 'https://example.com' },
        managerAddresses: ['0x123'],
        events: [],
      })
    })

    // Verify the behavior when manager addresses are provided vs. when they are not
    it('should use provided manager addresses if available', async () => {
      const mockSlug = 'test-collection'
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValueOnce(null)
      vi.spyOn(EventCollection, 'create').mockResolvedValueOnce({
        slug: mockSlug,
        managerAddresses: ['0x456', '0x789', '0x123'],
      } as any)

      const creatorAddress = '0x123'
      const result = await createEventCollectionOperation(
        {
          title: 'Test Collection',
          description: 'A test collection',
          banner: 'https://example.com/banner.jpg',
          links: [{ name: 'website', url: 'https://example.com' }],
          managerAddresses: ['0x456', '0x789'],
        },
        creatorAddress
      )

      // Assertions
      expect(EventCollection.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: 'test-collection',
          managerAddresses: ['0x456', '0x789', '0x123'],
          banner: 'https://example.com/banner.jpg',
          links: { website: 'https://example.com' },
        })
      )
      expect(result.managerAddresses).toEqual(['0x456', '0x789', '0x123'])
    })
  })

  describe('createEventCollectionSlug', () => {
    it('should create a unique slug', async () => {
      vi.spyOn(EventCollection, 'findByPk')
        .mockResolvedValueOnce({} as any) // First call returns an existing collection
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
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValueOnce(null)

      const slug = await createEventCollectionSlug(
        'Test Collection with Spécial Chàracters!'
      )

      expect(slug).toBe('test-collection-with-special-characters')
      expect(EventCollection.findByPk).toHaveBeenCalledWith(
        'test-collection-with-special-characters'
      )
    })
  })

  describe('getEventCollectionOperation', () => {
    // Verify retrieval of an event collection with associated events
    it('should retrieve an event collection with associated events', async () => {
      const mockSlug = 'test-collection'
      const mockEventCollection = {
        slug: mockSlug,
        title: 'Test Collection',
        description: 'A test collection',
        events: [
          { slug: 'event-1', title: 'Event 1' },
          { slug: 'event-2', title: 'Event 2' },
        ],
      }

      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(
        mockEventCollection as any
      )

      const result = await getEventCollectionOperation(mockSlug)

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith(mockSlug, {
        include: [
          {
            model: EventData,
            as: 'events',
            through: {
              attributes: [],
            },
          },
        ],
      })
      expect(JSON.parse(JSON.stringify(result))).toEqual(mockEventCollection)
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
        banner: 'https://example.com/old-banner.jpg',
        links: [{ name: 'website', url: 'https://example.com/old' }],
        managerAddresses: ['0x123'],
        update: vi.fn(),
      }

      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(
        mockEventCollection as any
      )

      const updatedData = {
        title: 'New Title',
        description: 'New Description',
        banner: 'https://example.com/new-banner.jpg',
        links: [{ name: 'website', url: 'https://example.com/new' }],
        managerAddresses: ['0x123', '0x456'],
      }

      await updateEventCollectionOperation(mockSlug, updatedData, '0x123')

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith(mockSlug)
      expect(mockEventCollection.update).toHaveBeenCalledWith(updatedData)
    })

    // Verify that an error is thrown when the collection is not found
    it('should throw an error when the collection is not found', async () => {
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(null)

      await expect(
        updateEventCollectionOperation('non-existent', {} as any, '0x123')
      ).rejects.toThrow('Event collection not found')
    })

    // Verify that an error is thrown when the user is not authorized
    it('should throw an error when the user is not authorized', async () => {
      const mockEventCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }

      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(
        mockEventCollection as any
      )

      await expect(
        updateEventCollectionOperation('test-collection', {}, '0x456')
      ).rejects.toThrow('Not authorized to update this collection')
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

      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(
        mockCollection as any
      )
      vi.spyOn(EventData, 'findOne').mockResolvedValue(mockEvent as any)
      vi.spyOn(EventCollectionAssociation, 'findOrCreate').mockResolvedValue([
        mockAssociation,
        true,
      ] as any)

      const result = await addEventToCollectionOperation(
        'test-collection',
        'test-event',
        '0x123'
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith('test-collection')
      expect(EventData.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-event' },
      })
      expect(EventCollectionAssociation.findOrCreate).toHaveBeenCalledWith({
        where: { eventSlug: 'test-event', collectionSlug: 'test-collection' },
        defaults: {
          eventSlug: 'test-event',
          collectionSlug: 'test-collection',
          isApproved: true,
        },
      })
      expect(result).toEqual({
        status: 'approved and added',
        association: mockAssociation,
      })
    })

    // Verify that an error is thrown when the collection is not found
    it('should throw an error when the collection is not found', async () => {
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(null)

      await expect(
        addEventToCollectionOperation('non-existent', 'test-event', '0x123')
      ).rejects.toThrow('Collection not found')
    })

    // Verify that an error is thrown when the event is not found
    it('should throw an error when the event is not found', async () => {
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue({} as any)
      vi.spyOn(EventData, 'findOne').mockResolvedValue(null)

      await expect(
        addEventToCollectionOperation(
          'test-collection',
          'non-existent',
          '0x123'
        )
      ).rejects.toThrow('Event not found')
    })
  })

  describe('getEventsInCollectionOperation', () => {
    // Verify retrieval of events in a collection
    it('should retrieve events in a collection', async () => {
      const mockCollection = {
        slug: 'test-collection',
        managerAddresses: ['0x123'],
      }
      const mockEvents = [
        { slug: 'event-1', title: 'Event 1' },
        { slug: 'event-2', title: 'Event 2' },
      ]

      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(
        mockCollection as any
      )
      vi.spyOn(EventData, 'findAndCountAll').mockResolvedValue({
        count: 2,
        rows: mockEvents,
      } as any)

      const result = await getEventsInCollectionOperation(
        'test-collection',
        1,
        10,
        '0x123'
      )

      // Assertions
      expect(EventCollection.findByPk).toHaveBeenCalledWith('test-collection')
      expect(EventData.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: EventCollection,
              where: { slug: 'test-collection' },
            }),
          ]),
          limit: 10,
          offset: 0,
        })
      )
      expect(result).toEqual({
        events: mockEvents,
        totalCount: 2,
        currentPage: 1,
        totalPages: 1,
        isManager: true,
      })
    })

    // Verify that an error is thrown when the collection is not found
    it('should throw an error when the collection is not found', async () => {
      vi.spyOn(EventCollection, 'findByPk').mockResolvedValue(null)

      await expect(
        getEventsInCollectionOperation('non-existent', 1, 10, '0x123')
      ).rejects.toThrow('Collection not found')
    })
  })
})
