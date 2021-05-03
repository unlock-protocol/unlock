import React from 'react'
import * as rtl from '@testing-library/react'
import { ValidKey } from '../../../../components/interface/verification/Key'
import { OwnedKey } from '../../../../components/interface/keychain/KeychainTypes'
import { pingPoap } from '../../../../utils/poap'
import { AuthenticationContext } from '../../../../components/interface/Authenticate'

const network = 1984
const authentication = { network }

let useGetMetadataForResult = {
  metadata: {
    userMetadata: {},
  },
  loading: false,
  error: false,
}
const mockUseMarkAsCheckedIn = {
  markAsCheckedIn: jest.fn(),
  checkedIn: false,
  error: false,
}
jest.mock('../../../../hooks/useGetMetadataFor.js', () => {
  return jest.fn().mockImplementation(() => {
    return useGetMetadataForResult
  })
})

jest.mock('../../../../hooks/useIsLockManager', () => {
  return jest.fn().mockImplementation(() => ({ isLockManager: true }))
})

jest.mock('../../../../hooks/useMarkAsCheckedIn.js', () => {
  return jest.fn().mockImplementation(() => {
    return mockUseMarkAsCheckedIn
  })
})

jest.mock('../../../../utils/poap')

const ownerViewer = '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715'

const ownedKey: OwnedKey = {
  lock: {
    address: '0x123abc',
    name: 'Lock Around the Clock',
    expirationDuration: '123456',
    tokenAddress: 'a token address',
    price: '5',
    owner: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
  },
  tokenURI: '',
  expiration: '12345678',
  id: 'an id',
  keyId: 'a key id',
}

const signatureTimestamp = 12312412
const owner = '0xkeyOwner'
const viewer = '0xviewer'

const render = (Component: any) => {
  return rtl.render(
    <AuthenticationContext.Provider value={authentication}>
      {Component}
    </AuthenticationContext.Provider>
  )
}

describe('ValidKey component', () => {
  beforeEach(() => {
    useGetMetadataForResult = {
      metadata: {
        userMetadata: {},
      },
      loading: false,
      error: false,
    }
  })

  it('should render a valid key with no metadata', () => {
    expect.assertions(1)
    useGetMetadataForResult = {
      metadata: {
        userMetadata: {},
      },
      loading: false,
      error: false,
    }
    const wrapper = render(
      <ValidKey
        signature="signature"
        ownedKey={ownedKey}
        signatureTimestamp={signatureTimestamp}
        owner={owner}
        viewer={ownerViewer}
      />
    )
    expect(wrapper.queryByText('Valid Key')).not.toBeNull()
  })
  it('should not useGetMetadataFor if the viewer is not the lock owner', () => {
    expect.assertions(1)
    const wrapper = render(
      <ValidKey
        signature="signature"
        ownedKey={ownedKey}
        signatureTimestamp={signatureTimestamp}
        owner={owner}
        viewer={viewer}
      />
    )
    expect(wrapper.queryByText('julien@unlock-protocol.com')).toBeNull()
  })

  it('should mark the key as checked in and ping poap when the user invokes checkIn', () => {
    expect.assertions(2)
    useGetMetadataForResult = {
      metadata: {
        userMetadata: {},
      },
      loading: false,
      error: false,
    }
    const signature = 'signature'
    const wrapper = render(
      <ValidKey
        signature={signature}
        ownedKey={ownedKey}
        signatureTimestamp={signatureTimestamp}
        owner={owner}
        viewer={ownerViewer}
      />
    )
    const markAsCheckedInButton = wrapper.getByText('Mark as Checked-In')
    rtl.fireEvent.click(markAsCheckedInButton)
    expect(mockUseMarkAsCheckedIn.markAsCheckedIn).toHaveBeenCalled()
    expect(pingPoap).toHaveBeenCalledWith(
      ownedKey,
      owner,
      signature,
      signatureTimestamp
    )
  })
})
