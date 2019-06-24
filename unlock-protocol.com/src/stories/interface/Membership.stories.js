import React from 'react'
import { storiesOf } from '@storybook/react'
import {
  Membership,
  MembershipUnlocked,
  MembershipLocked,
} from '../../components/interface/Membership'

storiesOf('Membership', module)
  .add('unknown state', () => {
    return <Membership />
  })
  .add('unlocked state', () => {
    return <MembershipUnlocked />
  })
  .add('locked state', () => {
    return <MembershipLocked becomeMember={() => {}} />
  })
