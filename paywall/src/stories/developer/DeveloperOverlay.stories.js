import React from 'react'
import { storiesOf } from '@storybook/react'
import { object, text, withKnobs } from '@storybook/addon-knobs'
import { DeveloperOverlay } from '../../components/developer/DeveloperOverlay'

storiesOf('DeveloperOverlay', DeveloperOverlay)
  .addDecorator(withKnobs)
  .add('the developer overlay (visible in development)', () => {
    const config = {
      env: 'dev',
      providers: object('Providers', { HTTP: {}, Metamask: {} }),
    }

    const selected = text('Selected Provider', 'HTTP')

    return (
      <DeveloperOverlay
        config={config}
        selected={selected}
        setProvider={() => {}}
      />
    )
  })
  .add('the developer overlay (invisible outside development)', () => {
    const config = {
      env: 'prod',
      providers: { HTTP: {}, Metamask: {} },
    }

    const selected = 'HTTP'

    return (
      <DeveloperOverlay
        config={config}
        selected={selected}
        setProvider={() => {}}
      />
    )
  })
