import React from 'react'
import * as rtl from '@testing-library/react'
import { MetadataTable } from '../../../components/interface/MetadataTable'
import { ConfigContext } from '../../../utils/withConfig'
import {
  AuthenticationContext,
  defaultValues,
} from '../../../contexts/AuthenticationContext'

const metadata = [
  {
    lockName: 'Giant Martian Insect Party',
    keyholderAddress: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
    expiration: '123456789',
    emailAddress: 'support@tether.to',
  },
  {
    lockName: 'Giant Martian Insect Party',
    keyholderAddress: '0x84BCb1DFF32Ee9e7Bc7c6868954C3E6F346046b4',
    expiration: '123456789',
    emailAddress: 'rex.smythe@higgi.ns',
  },
  {
    lockName: 'Giant Martian Insect Party',
    keyholderAddress: '0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE',
    expiration: '123456789',
    emailAddress: 'ssgt_jones@area51.gov',
  },
  {
    lockName: 'Giant Martian Insect Party',
    keyholderAddress: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
    expiration: '123456789',
    emailAddress: "we don't validate email inputs",
  },
]

const render = (component: any) => {
  return rtl.render(
    <AuthenticationContext.Provider
      value={{
        ...defaultValues,
        network: 1,
      }}
    >
      <ConfigContext.Provider
        value={{
          networks: {
            1: {
              provider: 'http://provider',
            },
          },
        }}
      >
        {component}
      </ConfigContext.Provider>
    </AuthenticationContext.Provider>
  )
}

describe('MetadataTable', () => {
  describe('MetadataTable component', () => {
    it('renders members cards correctly', () => {
      expect.assertions(1)

      const { container } = render(
        <MetadataTable
          columns={[
            'lockName',
            'keyholderAddress',
            'expiration',
            'emailAddress',
          ]}
          metadata={metadata}
          filter={'all'}
        />
      )

      const memberCards = container.querySelectorAll(
        '[data-testid="member-card"]'
      )
      expect(memberCards.length).toEqual(4)
    })

    describe('when there are no keys', () => {
      it('should show a message when there is no match on when showing all keys', () => {
        expect.assertions(1)

        const wrapper = render(
          <MetadataTable columns={[]} metadata={[]} filter={'all'} />
        )
        expect(
          wrapper.getByText('No keys have been purchased yet.', {
            exact: false,
          })
        ).not.toBeNull()
      })

      it('should show a message when there is no match on when showing only active keys', () => {
        expect.assertions(1)

        const wrapper = render(
          <MetadataTable columns={[]} metadata={[]} filter={'active'} />
        )
        expect(
          wrapper.getByText('No keys found matching the current filter.')
        ).not.toBeNull()
      })
    })
  })
})
