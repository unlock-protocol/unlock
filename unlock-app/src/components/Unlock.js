import React from 'react'
import { Route, Switch } from 'react-router'

import LockMaker from './creator/LockMaker'
import Lock from './consumer/Lock'
import Home from './Home'

export const Unlock = () => {
  return (
    <div className="container">
      <Switch>
        <Route path="/creator" component={LockMaker} />
        <Route path="/lock/:lockAddress" component={Lock} />
        <Route path="*" component={Home} />
      </Switch>
    </div>
  )
}

export default Unlock
