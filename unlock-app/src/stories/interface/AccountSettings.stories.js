import React from 'react'
import { storiesOf } from '@storybook/react'
import { AccountInfo } from '../../components/interface/user-account/AccountInfo'
import { ChangePassword } from '../../components/interface/user-account/ChangePassword'
import { changePassword } from '../../actions/user'

storiesOf('Account Settings/Components/AccountInfo', module)
  .add('no info', () => {
    return <AccountInfo email="" address="" />
  })
  .add('info provided', () => {
    return (
      <AccountInfo
        emailAddress="gordon@lonsdale.me"
        address="0x09438E46Ea66647EA65E4b104C125c82076FDcE5"
      />
    )
  })

storiesOf('Account Settings/Components/ChangePassword', module).add(
  'default',
  () => {
    return <ChangePassword changePassword={changePassword} />
  }
)
