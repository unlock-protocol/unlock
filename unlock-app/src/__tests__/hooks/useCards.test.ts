import React from 'react'
import { EventEmitter } from 'events'
import { renderHook } from '@testing-library/react-hooks'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import * as UseCards from '../../hooks/useCards'
import { vi } from 'vitest'

class MockWalletService extends EventEmitter {
  constructor() {
    super()
  }
}

let mockWalletService: any

const locksmithHost = 'https://locksmith'
const userAddress = '0xuser'

const stripeToken = 'tok_token'

const config = {
  services: {
    storage: {
      host: locksmithHost,
    },
  },
}

const signature = 'signature'

const walletService = {
  signMessage: vi.fn(() => signature),
}

describe('UseCards', () => {
  beforeEach(() => {
    // @ts-ignore
    fetch.resetMocks()
    vi.clearAllMocks()

    vi.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === ConfigContext) {
        return config
      }
    })

    mockWalletService = new MockWalletService()
    mockWalletService.signMessage = vi.fn().mockResolvedValue('a signature')
  })

  describe('useCards', () => {
    it.skip('should call WalletService.signMessage with the correct values', async () => {
      expect.assertions(1)

      fetch.mockResponseOnce(JSON.stringify([]))

      const { result, waitFor } = renderHook(() => UseCards.useCards())

      await waitFor(() => !!result.current.cards)

      expect(mockWalletService.signMessage).toHaveBeenCalledWith(
        userAddress,
        expect.any(Object)
      )
    })
  })

  describe('deleteCardForAddress', () => {
    it('should send the signed request to locksmith', async () => {
      expect.assertions(5)

      fetch.mockResponseOnce(JSON.stringify(''))

      const typedData = {
        types: {
          User: [{ name: 'publicKey', type: 'address' }],
        },
        domain: { name: 'Unlock', version: '1' },
        primaryType: 'User',
        message: {
          'Delete Card': { publicKey: userAddress },
        },
        messageKey: 'Delete Card',
      }

      await UseCards.deleteCardForAddress(config, walletService, userAddress)
      expect(walletService.signMessage).toHaveBeenCalledWith(
        'I am deleting the card linked to my account 0xuser',
        'personal_sign'
      )
      expect(fetch.mock.calls.length).toEqual(1)
      expect(fetch.mock.calls[0][0]).toEqual(
        `${locksmithHost}/users/${userAddress}/credit-cards?data=${JSON.stringify(
          typedData
        )}`
      )
      const request = fetch.mock.calls[0][1]
      expect(request?.headers).toEqual({
        Authorization: 'Bearer-Simple c2lnbmF0dXJl',
        'Content-Type': 'application/json',
      })
      expect(request?.method).toEqual('DELETE')
    })
  })
})
