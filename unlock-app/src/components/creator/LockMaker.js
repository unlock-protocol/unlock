import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Authenticate from '../Authenticate'
import Account from '../Account'

import LockMakerForm from './LockMakerForm'
import Locks from './Locks'
import Lock from './Lock'

import UnlockPropTypes from '../../propTypes'

export const LockMaker = (props) => {
  // let's rather show the login form if the user is not logged in!
  if (!props.account) {
    return (
      <div className="container">
        <div className="row align-items-center justify-content-center" style={{ height: '300px' }}>
          <div className="col align-items-center col-6 col-sm-12">
            <div className="card">
              <div className="card-header">Authenticate</div>
              <div className="card-body">
                <Authenticate />
              </div>
            </div>

          </div>
        </div>
      </div>
    )
  }
  return (

    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light">
        <form className="form-inline col-12">
          <Account />
        </form>
      </nav>
      <div className="row">
        <LockMakerForm />
        <Locks />
        <Route exact={true} path="/" render={() => {
          return (<p></p>)
        }} />
        <Route path="/creator/lock/:lockAddress" component={Lock} />
      </div>
    </div>

  )
}

LockMaker.propTypes = {
  account: UnlockPropTypes.account,
}

const mapStateToProps = state => {
  return {
    account: state.account,
  }
}

export default connect(mapStateToProps)(LockMaker)
