import React from 'react'
import { storiesOf } from '@storybook/react'
import InlineModal from '../../components/interface/InlineModal'
import QRModal from '../../components/interface/keyChain/QRModal'

storiesOf('InlineModal', module)
  .add('When active', () => {
    return (
      <InlineModal active dismiss={() => {}}>
        <p>Just some text to show the modal with.</p>
      </InlineModal>
    )
  })
  .add('When inactive (renders nothing)', () => {
    return (
      <InlineModal active={false} dismiss={() => {}}>
        <p>Just some text to show the modal with.</p>
      </InlineModal>
    )
  })
  .add('In QR Code form', () => {
    return (
      <QRModal
        active
        dismiss={() => {}}
        value="Just some test data"
        sendEmail={() => {}}
      />
    )
  })
