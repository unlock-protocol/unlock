import React from 'react'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap'

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
      <div className="row align-items-center justify-content-center">
        <div className="col-4">
          <Card>
            <CardHeader>Authenticate</CardHeader>
            <CardBody>
              <Authenticate />
            </CardBody>
          </Card>
        </div>
      </div>)
  }
  return (

    <div>
      <nav className="navbar navbar-expand-lg navbar-light">
        <form className="form-inline col-12">
          <Account />
        </form>
      </nav>
      <Row>
        <Col>
          <LockMakerForm />
        </Col>
        <Col>
          <Locks />
        </Col>
        <Col>
          <Route exact={true} path="/" render={() => {
            return (<p></p>)
          }} />
          <Route path="/creator/lock/:lockAddress" component={Lock} />
        </Col>
      </Row>
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
