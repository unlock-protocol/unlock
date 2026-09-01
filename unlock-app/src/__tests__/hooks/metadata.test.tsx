import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act } from '@testing-library/react-hooks'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateMetadata } from '~/hooks/metadata'
import { locksmith } from '~/config/locksmith'

vi.mock('@unlock-protocol/ui', () => ({
  ToastHelper: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('~/config/locksmith', () => ({
  locksmith: {
    keyMetadata: vi.fn(),
    lockMetadata: vi.fn(),
    updateKeyMetadata: vi.fn(),
    updateLockMetadata: vi.fn(),
  },
}))

const createWrapper = (queryClient: QueryClient) => {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useUpdateMetadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the metadata query cache with the saved lock metadata', async () => {
    const lockAddress = '0x1234567890123456789012345678901234567890'
    const network = 1
    const queryKey = ['metadata', network, lockAddress, undefined]
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
        queries: {
          retry: false,
        },
      },
    })

    const previousMetadata = {
      attributes: [],
      name: 'Membership',
    }
    const savedMetadata = {
      attributes: [
        {
          trait_type: 'Color',
          value: 'Blue',
        },
        {
          trait_type: 'Size',
          value: 'Large',
        },
        {
          trait_type: 'Access',
          value: 'VIP',
        },
      ],
      image: 'https://example.com/icon.png',
      name: 'Membership',
    }

    queryClient.setQueryData(queryKey, previousMetadata)
    vi.mocked(locksmith.updateLockMetadata).mockResolvedValue({
      data: savedMetadata,
    })

    const { result } = renderHook(
      () =>
        useUpdateMetadata({
          lockAddress,
          network,
        }),
      {
        wrapper: createWrapper(queryClient),
      }
    )

    await act(async () => {
      await result.current.mutateAsync(savedMetadata)
    })

    expect(locksmith.updateLockMetadata).toHaveBeenCalledWith(
      network,
      lockAddress,
      {
        metadata: savedMetadata,
      }
    )
    expect(queryClient.getQueryData(queryKey)).toEqual(savedMetadata)
  })
})
