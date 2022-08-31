import { useState } from 'react'
import { Router, Outlet, Route } from '@tanstack/react-location'
import { ReactLocationDevtools } from '@tanstack/react-location-devtools'
import { routes, location } from '~/config/routes'

function App() {
  return (
    <Router routes={routes} location={location}>
      <Outlet />
      <ReactLocationDevtools initialIsOpen={false} />
    </Router>
  )
}

export default App
