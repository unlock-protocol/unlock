import React from 'react'
import { Route, Switch } from 'react-router'

import LockMaker from './creator/LockMaker'
import Lock from './consumer/Lock'
import Home from './Home'
import Network from './Network'

export function Unlock() {
  return (
    <div className="container">
      <Switch>
        <Route path="/network" component={Network} />
        <Route path="/creator" component={LockMaker} />
        <Route path="/lock/:lockAddress" component={Lock} />
        <Route path="*" component={Home} />
      </Switch>
    </div>
  )
}

export default Unlock
