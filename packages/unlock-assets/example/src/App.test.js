import React from 'react'
import App from './App'
import { createRoot } from 'react-dom/client'

it('renders without crashing', () => {
  const div = document.createElement('div')

  const container = document.getElementById('app')
  const root = createRoot(container)
  root.render(<App />, div)
  root.unmount(div)
})
