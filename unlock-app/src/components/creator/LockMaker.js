import React from 'react'
import { Route } from 'react-router-dom'

import { Row, Col } from 'reactstrap'

import LockMakerForm from './LockMakerForm'
import Locks from './Locks'
import Lock from './Lock'

const LockMaker = (props) => {
  return (
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
  )
}

export default LockMaker
