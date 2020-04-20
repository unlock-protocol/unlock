import { renderHook } from '@testing-library/react-hooks'
import * as Redux from 'react-redux'
import React from 'react'
import { useProvider, EthereumWindow } from '../../hooks/useProvider'
import { ConfigContext } from '../../utils/withConfig'

let mockDispatch = jest.fn()

const mockConfig = {
  env: 'test',
  httpProvider: 'localhost',
}

let mockWeb3Provider: any = null

const mockWeb3ProviderContext = {
  getWeb3Provider: jest.fn(),
  setWeb3Provider: jest.fn(),
}

jest.mock('react-redux', () => {
  const ActualReactRedux = require.requireActual('react-redux')
  return {
    ...ActualReactRedux,
    useDispatch: () => {
      return mockDispatch
    },
  }
})

jest.spyOn(Redux, 'useSelector').mockImplementation(selector => {
  return selector({
    provider: 'Unlock',
  })
})

jest.spyOn(React, 'useContext').mockImplementation(context => {
  if (context === ConfigContext) {
    return mockConfig
  }
  return mockWeb3ProviderContext
})

describe('useProvider', () => {
  beforeEach(() => {
    mockDispatch = jest.fn()
    mockWeb3Provider = null
    mockWeb3ProviderContext.setWeb3Provider = jest.fn(web3Provider => {
      mockWeb3Provider = web3Provider
    })
    mockWeb3ProviderContext.getWeb3Provider = jest.fn(() => mockWeb3Provider)
  })

  describe('in the test environment', () => {
    it('should use the provider from the local node', async () => {
      expect.assertions(2)

      const { result, wait } = renderHook(() => useProvider())

      await wait(() => !result.current.loading)
      expect(mockWeb3ProviderContext.setWeb3Provider).toHaveBeenCalledWith(
        `http://${mockConfig.httpProvider}:8545`
      )
      expect(result.current).toEqual({
        provider: `http://${mockConfig.httpProvider}:8545`,
        loading: false,
      })
    })
  })

  describe('when not using the test environment', () => {
    beforeEach(() => {
      mockConfig.env = 'dev'
    })

    it('returns no provider if none is set in the window', async () => {
      expect.assertions(1)

      const { result, wait } = renderHook(() => useProvider())

      await wait(() => !result.current.loading)

      expect(result.current).toEqual({
        provider: null,
        loading: false,
      })
    })

    it('returns a provider if web3 is defined on the window', async () => {
      expect.assertions(2)
      const web3Provider = {}

      const ethereumWindow = (window as unknown) as EthereumWindow

      ethereumWindow.web3 = {
        currentProvider: web3Provider,
      }

      const { result, wait } = renderHook(() => useProvider())

      await wait(() => !result.current.loading)
      expect(mockWeb3ProviderContext.setWeb3Provider).toHaveBeenCalledWith(
        web3Provider
      )
      expect(result.current).toEqual({
        provider: web3Provider,
        loading: false,
      })
    })

    describe('when window.ethereum is defined', () => {
      it('should enable the provider and yield it', async () => {
        expect.assertions(4)
        const web3Provider = {}

        const ethereumWindow = (window as unknown) as EthereumWindow

        ethereumWindow.ethereum = {
          enable: jest.fn(() => Promise.resolve([])),
          currentProvider: web3Provider,
        }

        const { result, wait } = renderHook(() => useProvider())

        await wait(() => !result.current.loading)
        expect(mockWeb3ProviderContext.setWeb3Provider).toHaveBeenCalledWith(
          ethereumWindow.ethereum
        )
        expect(mockDispatch).toHaveBeenCalledTimes(3)
        expect(ethereumWindow.ethereum.enable).toHaveBeenCalled()
        expect(result.current).toEqual({
          provider: ethereumWindow.ethereum,
          loading: false,
        })
      })
    })

    describe('when the context already has a provider', () => {
      it('should stop loading and use the existing provider', async () => {
        expect.assertions(2)

        const provider = {
          enable: jest.fn(() => Promise.resolve([])),
          currentProvider: {},
        }

        mockWeb3ProviderContext.getWeb3Provider = jest.fn(() => provider)

        mockWeb3ProviderContext.setWeb3Provider = jest.fn()

        const { result, wait } = renderHook(() => useProvider())

        await wait(() => !result.current.loading)
        expect(mockWeb3ProviderContext.setWeb3Provider).not.toHaveBeenCalled()
        expect(result.current).toEqual({
          provider,
          loading: false,
        })
      })
    })
  })
})
