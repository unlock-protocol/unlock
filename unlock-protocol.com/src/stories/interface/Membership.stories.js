import React from 'react'
import { storiesOf } from '@storybook/react'
import Membership from '../../components/interface/Membership'

const becomeMember = () => {}

storiesOf('Membership', module)
  .add('unknown state', () => {
    return <Membership becomeMember={becomeMember} />
  })
  .add('unlocked state', () => {
    return <Membership isMember="yes" becomeMember={becomeMember} />
  })
  .add('locked state', () => {
    return <Membership isMember="no" becomeMember={becomeMember} />
  })
