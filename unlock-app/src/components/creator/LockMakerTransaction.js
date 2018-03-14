import React from 'react'

class LockMakerTransaction extends React.Component {
  render () {
    console.log(this.props)
    return (<span>Transaction! {this.props.status}</span>)
  }
}

export default LockMakerTransaction
