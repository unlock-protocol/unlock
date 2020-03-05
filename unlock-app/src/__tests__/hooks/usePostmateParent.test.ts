import Postmate from 'postmate'
import { renderHook } from '@testing-library/react-hooks'
import { usePostmateParent } from '../../hooks/usePostmateParent'

let emit = jest.fn()

describe('usePostmateParent', () => {
  beforeEach(() => {
    emit = jest.fn()
    jest.spyOn(Postmate, 'Model').mockResolvedValue({ emit })
  })

  it('returns undefined at first, then a Postmate ChildApi once the handshake completes', async () => {
    expect.assertions(2)

    const { result, wait } = renderHook(() => usePostmateParent())

    expect(result.current).toBeUndefined()

    await wait(() => {
      return !!result.current
    })

    expect(result.current).toEqual(
      expect.objectContaining({
        emit: expect.any(Function),
      })
    )
  })
})
