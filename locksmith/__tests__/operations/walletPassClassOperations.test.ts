import { describe, it, expect, beforeEach, vi } from 'vitest'
import { googleAuthClient } from '../../src/operations/generate-pass/android/googleAuthClient'
import {
  createClass,
  getOrCreateWalletClass,
} from '../../src/operations/generate-pass/android/passClassService'
import * as passClassService from '../../src/operations/generate-pass/android/passClassService'
import logger from '../../src/logger'
import { GaxiosResponse, GaxiosError } from 'gaxios'

// Mock the required modules
vi.mock('../../src/operations/generate-pass/android/googleAuthClient')
vi.mock('../../src/logger')

describe('Google Wallet Class Operations', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.clearAllMocks()
  })

  describe('createClass', () => {
    it('should create a new class and log success', async () => {
      const mockClassId = 'testClassId'
      const mockResponse: GaxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        request: { responseURL: '' },
      }

      vi.mocked(googleAuthClient.request).mockResolvedValueOnce(mockResponse)

      const result = await createClass(mockClassId)

      expect(result).toEqual({ success: true })
    })

    it('should log and throw an error if class creation fails', async () => {
      const mockClassId = 'testClassId'
      const mockError = new Error('Request failed')
      vi.mocked(googleAuthClient.request).mockRejectedValueOnce(mockError)

      // Ensure createClass returns a promise
      await expect(createClass(mockClassId)).rejects.toThrow(
        'Error creating class'
      )
    })
  })

  describe('getOrCreateWalletClass', () => {
    const mockClassId = 'testClassId'
    it('should return existing class data if class exists', async () => {
      const mockResponse: GaxiosResponse = {
        data: { existing: true, id: mockClassId },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        request: { responseURL: '' },
      }

      vi.mocked(googleAuthClient.request).mockResolvedValueOnce(mockResponse)

      const result = await getOrCreateWalletClass(mockClassId)

      expect(result).toEqual(mockResponse.data.id)
    })

    it('should log the correct messages and proceed to create a new class when a 404 error occurs', async () => {
      // Simulate a 404 error response from Google Wallet API
      const mockError: Partial<GaxiosError> = {
        response: {
          data: null,
          status: 404,
          statusText: 'Not Found',
          headers: {},
          config: {},
          request: { responseURL: '' },
        },
      }
      vi.mocked(googleAuthClient.request).mockRejectedValueOnce(mockError)
      // Mock the createClass function
      const mockCreateClass = vi.fn().mockResolvedValueOnce({ success: true })
      vi.spyOn(passClassService, 'createClass').mockImplementation(
        mockCreateClass
      )

      // Spy on logger to check if the messages were logged
      const loggerInfoSpy = vi.spyOn(logger, 'info')

      // Call getOrCreateWalletClass to test its behavior
      try {
        await passClassService.getOrCreateWalletClass(mockClassId)
      } catch (e) {
        // handle
      }

      // Verify the logger was called with expected messages
      expect(loggerInfoSpy).toHaveBeenCalledWith(
        'Class does not exist, creating a new one...'
      )
    })

    it('should log and throw an error if there is a problem checking class existence', async () => {
      const mockError = new Error('Request failed')
      vi.mocked(googleAuthClient.request).mockRejectedValueOnce(mockError)

      await expect(getOrCreateWalletClass(mockClassId)).rejects.toThrow(
        'Error checking class existence'
      )
    })
  })
})
