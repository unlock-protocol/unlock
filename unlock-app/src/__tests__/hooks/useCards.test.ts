import React from 'react'
import { EventEmitter } from 'events'
import { renderHook } from '@testing-library/react-hooks'
import fetch from 'jest-fetch-mock'
import { WalletServiceContext } from '../../utils/withWalletService'
import { ConfigContext } from '../../utils/withConfig'
import * as UseCards from '../../hooks/useCards'

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
  signMessage: jest.fn(() => signature),
}

describe('UseCards', () => {
  beforeEach(() => {
    fetch.resetMocks()
    jest.clearAllMocks()

    jest.spyOn(React, 'useContext').mockImplementation((context) => {
      if (context === WalletServiceContext) {
        return mockWalletService
      }
      if (context === ConfigContext) {
        return config
      }
    })

    mockWalletService = new MockWalletService()
    mockWalletService.signMessage = jest.fn().mockResolvedValue('a signature')
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

  describe('saveCardsForAddress', () => {
    it('should send the signed request to locksmith', async () => {
      expect.assertions(6)

      fetch.mockResponseOnce(JSON.stringify(['FUCK']))

      const typedData = {
        domain: { name: 'Unlock', version: '1' },
        message: {
          'Save Card': { publicKey: userAddress, stripeTokenId: 'tok_token' },
        },
        messageKey: 'Save Card',
        primaryType: 'User',
        types: {
          User: [{ name: 'publicKey', type: 'address' }],
        },
      }

      await UseCards.saveCardsForAddress(
        config,
        walletService,
        userAddress,
        stripeToken
      )
      expect(walletService.signMessage).toHaveBeenCalledWith(
        'I save my payment card for my account 0xuser',
        'personal_sign'
      )
      expect(fetch.mock.calls.length).toEqual(1)
      expect(fetch.mock.calls[0][0]).toEqual(
        `${locksmithHost}/users/${userAddress}/credit-cards`
      )
      const request = fetch.mock.calls[0][1]
      expect(JSON.parse(request?.body as string)).toEqual(typedData)
      expect(request?.headers).toEqual({
        Authorization: 'Bearer-Simple c2lnbmF0dXJl',
        'Content-Type': 'application/json',
      })
      expect(request?.method).toEqual('PUT')
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
