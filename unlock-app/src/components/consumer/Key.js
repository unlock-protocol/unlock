import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import React from 'react'
import { connect } from 'react-redux'
import Duration from '../helpers/Duration'

import { setTransaction } from '../../actions/transaction'

import { unlockIfKeyIsValid } from '../../services/iframeService'

export class Key extends React.Component {
  constructor(props) {
    super(props)
    this.closeModal = this.closeModal.bind(this)
  }

  closeModal() {
    this.props.setTransaction(null) // Reset the transaction when closing!
    unlockIfKeyIsValid({ key: this.props.currentKey })
  }

  render() {
    const secondsToExpiration =
      this.props.currentKey.expiration - Math.floor(new Date().getTime() / 1000)

    return (
      <div className="card-body">
        <h5 className="card-title">Members only</h5>
        <p className="card-text">Your key expires in <Duration seconds={secondsToExpiration.toString(10)} />.</p>
        <button className="btn btn-primary" color="primary" onClick={() => { this.closeModal() }}>Close</button>
      </div>)

  }
}

Key.propTypes = {
  setTransaction: PropTypes.func,
  currentKey: UnlockPropTypes.key,
}

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = dispatch => ({
  setTransaction: (transaction) => dispatch(setTransaction(transaction)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Key)
