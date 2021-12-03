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
  unformattedSignTypedData: jest.fn(() => signature),
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
    mockWalletService.unformattedSignTypedData = jest
      .fn()
      .mockResolvedValue('a signature')
  })

  describe('useCards', () => {
    it.skip('should call WalletService.unformattedSignTypedData with the correct values', async () => {
      expect.assertions(1)

      fetch.mockResponseOnce(JSON.stringify([]))

      const { result, waitFor } = renderHook(() => UseCards.useCards())

      await waitFor(() => !!result.current.cards)

      expect(mockWalletService.unformattedSignTypedData).toHaveBeenCalledWith(
        userAddress,
        expect.any(Object)
      )
    })

    it.skip('should return an error when the fetch fails', async () => {
      expect.assertions(1)

      fetch.mockRejectedValueOnce(new Error('fail'))

      const { result, waitFor } = renderHook(() => UseCards.useCards())

      await waitFor(() => !!result.current.error)

      expect(result.current.error!.message).toEqual('fail')
    })
  })

  describe('saveCardsForAddress', () => {
    it('should send the signed request to locksmith', async () => {
      expect.assertions(6)

      fetch.mockResponseOnce(JSON.stringify(['FUCK']))

      const typedData = {
        domain: { name: 'Unlock', version: '1' },
        message: {
          user: { publicKey: userAddress, stripeTokenId: 'tok_token' },
        },
        primaryType: 'User',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
            { name: 'salt', type: 'bytes32' },
          ],
          User: [{ name: 'publicKey', type: 'address' }],
        },
      }

      await UseCards.saveCardsForAddress(
        config,
        walletService,
        userAddress,
        stripeToken
      )
      expect(walletService.unformattedSignTypedData).toHaveBeenCalledWith(
        userAddress,
        typedData
      )
      expect(fetch.mock.calls.length).toEqual(1)
      expect(fetch.mock.calls[0][0]).toEqual(
        `${locksmithHost}/users/${userAddress}/credit-cards`
      )
      const request = fetch.mock.calls[0][1]
      expect(JSON.parse(request?.body as string)).toEqual(typedData)
      expect(request?.headers).toEqual({
        Authorization: ' Bearer c2lnbmF0dXJl',
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
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
            { name: 'salt', type: 'bytes32' },
          ],
          User: [{ name: 'publicKey', type: 'address' }],
        },
        domain: { name: 'Unlock', version: '1' },
        primaryType: 'User',
        message: {
          user: { publicKey: userAddress },
        },
      }

      await UseCards.deleteCardForAddress(config, walletService, userAddress)
      expect(walletService.unformattedSignTypedData).toHaveBeenCalledWith(
        userAddress,
        typedData
      )
      expect(fetch.mock.calls.length).toEqual(1)
      expect(fetch.mock.calls[0][0]).toEqual(
        `${locksmithHost}/users/${userAddress}/credit-cards?data=${JSON.stringify(
          typedData
        )}`
      )
      const request = fetch.mock.calls[0][1]
      expect(request?.headers).toEqual({
        Authorization: ' Bearer c2lnbmF0dXJl',
        'Content-Type': 'application/json',
      })
      expect(request?.method).toEqual('DELETE')
    })
  })
})
