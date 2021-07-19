import React from 'react'
import { storiesOf } from '@storybook/react'
import HomeContent from '../../components/content/HomeContent'
import Demo from '../../components/interface/Demo'

const becomeMember = () => {}

storiesOf('HomeContent', module)
  .add('Homepage content', () => <HomeContent posts={[]} />)
  .add('Demo loading', () => (
    <Demo isMember="pending" becomeMember={becomeMember} />
  ))
  .add('Demo unlocked', () => (
    <Demo isMember="yes" becomeMember={becomeMember} />
  ))
  .add('Demo locked', () => <Demo isMember="no" becomeMember={becomeMember} />)
