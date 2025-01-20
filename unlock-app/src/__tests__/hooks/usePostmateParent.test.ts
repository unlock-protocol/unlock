// usePostmateParent.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import Postmate from 'postmate'
import { usePostmateParent } from '~/hooks/usePostmateParent'

describe('usePostmateParent', () => {
  let emit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock Postmate.Model to resolve with an object containing `emit`
    emit = vi.fn()
    vi.spyOn(Postmate, 'Model').mockResolvedValue({ emit })
  })

  it('returns undefined initially, then a Postmate ChildAPI after the async handshake', async () => {
    const { result } = renderHook(() => usePostmateParent())

    // Immediately after render, we expect the hook to still be undefined
    expect(result.current).toBeUndefined()

    // Wait for the effect that calls Postmate.Model to complete
    await waitFor(() => {
      // Wait until `result.current` is no longer undefined
      if (!result.current) {
        throw new Error('usePostmateParent did not resolve')
      }
      expect(result.current.emit).toBeDefined()
    })

    // Optionally, you can do a final check on the shape
    expect(result.current).toEqual(
      expect.objectContaining({
        emit: expect.any(Function),
      })
    )
  })
})
