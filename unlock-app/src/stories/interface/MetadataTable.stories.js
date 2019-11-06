import React from 'react'
import { storiesOf } from '@storybook/react'
import { MetadataTable } from '../../components/interface/MetadataTable'

storiesOf('MetadataTable', module)
  .add('The table, with just the three guaranteed properties (no data)', () => {
    return (
      <MetadataTable
        columns={['lockName', 'keyholderAddress', 'expiration']}
        metadata={[]}
      />
    )
  })
  .add(
    'The table, with just the three guaranteed properties (with data)',
    () => {
      const metadata = [
        {
          lockName: 'Giant Martian Insect Party',
          keyholderAddress: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
          expiration: '123456789',
        },
        {
          lockName: 'Giant Martian Insect Party',
          keyholderAddress: '0x84BCb1DFF32Ee9e7Bc7c6868954C3E6F346046b4',
          expiration: '123456789',
        },
        {
          lockName: 'Giant Martian Insect Party',
          keyholderAddress: '0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE',
          expiration: '123456789',
        },
        {
          lockName: 'Giant Martian Insect Party',
          keyholderAddress: '0xaFAEfc6dd3C9feF66f92BA838b132644451F0715',
          expiration: '123456789',
        },
      ]
      return (
        <MetadataTable
          columns={['lockName', 'keyholderAddress', 'expiration']}
          metadata={metadata}
        />
      )
    }
  )
  .add('The table, with an additional property (with data)', () => {
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
    return (
      <MetadataTable
        columns={['lockName', 'keyholderAddress', 'expiration', 'emailAddress']}
        metadata={metadata}
      />
    )
  })
