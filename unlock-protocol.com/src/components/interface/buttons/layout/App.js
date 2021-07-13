import React from 'react'
import getConfig from 'next/config'
import LayoutButton from '../LayoutButton'

const App = (props) => (
  <LayoutButton
    bold
    target="_blank"
    href={`${getConfig().publicRuntimeConfig.unlockApp}/dashboard`}
    label="App"
    {...props}
  >
    App
  </LayoutButton>
)

export default App
