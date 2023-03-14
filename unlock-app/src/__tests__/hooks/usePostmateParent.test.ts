import Postmate from 'postmate'
import { renderHook } from '@testing-library/react-hooks'
import { usePostmateParent } from '../../hooks/usePostmateParent'
import { vi, expect, describe, it } from 'vitest'

let emit = vi.fn()

describe('usePostmateParent', () => {
  beforeEach(() => {
    emit = vi.fn()
    vi.spyOn(Postmate, 'Model').mockResolvedValue({ emit })
  })

  it('returns undefined at first, then a Postmate ChildApi once the handshake completes', async () => {
    expect.assertions(2)

    const { result, waitFor } = renderHook(() => usePostmateParent())

    expect(result.current).toBeUndefined()

    await waitFor(() => {
      return !!result.current
    })

    expect(result.current).toEqual(
      expect.objectContaining({
        emit: expect.any(Function),
      })
    )
  })
})
