import React from 'react'
import { storiesOf } from '@storybook/react'

import Home from '../pages/home'
import { ConfigContext } from '../utils/withConfig'
import configure from '../config'

const ConfigProvider = ConfigContext.Provider

const config = configure({
  env: 'production',
})
