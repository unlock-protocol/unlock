import React from 'react'
import PropTypes from 'prop-types'
import { Route } from 'react-router-dom'
import { connect } from 'react-redux'

import Authenticate from '../Authenticate'
import Account from '../Account'

import LockMakerForm from './LockMakerForm'
import Locks from './Locks'
import Lock from './Lock'

export class LockMaker extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      accountPickerShown: false,
    }
    this.toggleAccountPicker = this.toggleAccountPicker.bind(this)
  }

  toggleAccountPicker () {
    this.setState({ accountPickerShown: !this.state.accountPickerShown })
  }

  render() {
    if (this.state.accountPickerShown) {
      return (<div className="container">
        <header className="masthead mb-auto">
          <div className="inner">
            <h3 className="masthead-brand">&nbsp;</h3>
            <nav className="nav nav-masthead justify-content-center">
            </nav>
          </div>
        </header>
        <div className="row align-items-center justify-content-center" style={{ height: '300px' }}>
          <div className="col align-items-center col-6 col-sm-12">
            <div className="card">
              <div className="card-header">
                Authenticate
              </div>
              <div className="card-body">
                <Authenticate hideAccountPicker={this.toggleAccountPicker} />
              </div>
            </div>
          </div>
        </div>
      </div>
      )
    }
    return (
      <div>
        <header className="navbar navbar-expand navbar-dark flex-column flex-md-row bd-navbar">
          <Account showAccountPicker={this.toggleAccountPicker} />
        </header>
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
}

LockMaker.propTypes = {
  accountPickerShown: PropTypes.bool,
}

const mapStateToProps = state => {
  return {}
}

export default connect(mapStateToProps)(LockMaker)
