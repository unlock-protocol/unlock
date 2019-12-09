import { renderHook } from '@testing-library/react-hooks'
import reactRedux from 'react-redux'
import useGetMetadataFor from '../../hooks/useGetMetadataFor'
import { SIGN_BULK_METADATA_REQUEST } from '../../actions/keyMetadata'

jest.mock('react-redux', () => {
  return {
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
  }
})

const lockAddress = '0xlock'
const keyOwner = '0xowner'
const metadata = {
  protected: {
    email: 'julien@unlock-protocol.com',
  },
  public: {
    name: 'julien',
  },
}

describe('useGetMetadataFor', () => {
  it('should call signBulkMetadataRequest', async () => {
    expect.assertions(1)

    reactRedux.useSelector = jest.fn(() => {
      return {
        account: {
          address: keyOwner,
        },
      }
    })
    const dispatch = jest.fn()
    reactRedux.useDispatch = jest.fn(() => {
      return dispatch
    })

    renderHook(() => useGetMetadataFor(lockAddress, keyOwner))

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        lockAddress,
        owner: keyOwner,
        type: SIGN_BULK_METADATA_REQUEST,
      })
    )
  })

  it('should return the metadata for that user', async () => {
    expect.assertions(1)

    reactRedux.useSelector = jest.fn(() => {
      return {
        metadata: {
          [lockAddress]: {
            [keyOwner]: metadata,
          },
        },
      }
    })

    const { result } = renderHook(() =>
      useGetMetadataFor(lockAddress, keyOwner)
    )
    expect(result.current).toEqual(metadata)
  })
})
