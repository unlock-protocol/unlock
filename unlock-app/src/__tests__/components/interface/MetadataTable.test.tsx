import React from 'react'
import * as rtl from '@testing-library/react'
import { MetadataTable } from '../../../components/interface/MetadataTable'

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

describe('MetadataTable', () => {
  describe('MetadataTable component', () => {
    it('renders the headings correctly', () => {
      expect.assertions(4)

      const { container } = rtl.render(
        <MetadataTable
          columns={[
            'lockName',
            'keyholderAddress',
            'expiration',
            'emailAddress',
          ]}
          metadata={metadata}
        />
      )

      const headings = container.querySelectorAll('th')
      const expectedHeadings = [
        'Lock Name',
        'Keyholder Address',
        'Expiration',
        'Email Address',
      ]

      expectedHeadings.forEach((heading, index) => {
        expect(headings[index].textContent).toEqual(heading)
      })
    })

    it('Aligns matching values and headers', () => {
      expect.assertions(4)

      const { container } = rtl.render(
        <MetadataTable
          columns={[
            'lockName',
            'keyholderAddress',
            'expiration',
            'emailAddress',
          ]}
          metadata={metadata}
        />
      )

      const body = container.getElementsByTagName('tbody')[0]
      const firstRow = body.getElementsByTagName('tr')[0]
      const values = firstRow.getElementsByTagName('td')
      ;[
        'Giant Martian Insect Party',
        '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
        '123456789',
        'support@tether.to',
      ].forEach((expectedValue, index) => {
        expect(values[index].textContent).toEqual(expectedValue)
      })
    })
  })
})
