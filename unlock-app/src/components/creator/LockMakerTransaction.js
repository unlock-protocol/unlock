import React from 'react'

class LockMakerTransaction extends React.Component {
  render () {
    // TODO: show confirmations?
    if (!this.props.status) {
      return (<span>&nbsp;</span>)
    } else if (this.props.receipt) {
      return (<span>CONFIRMED transaction...</span>)
    } else {
      return (<span>Confirming transaction...</span>)
    }
  }
}

export default LockMakerTransaction
