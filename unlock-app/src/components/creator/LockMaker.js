import React from 'react'
import PropTypes from 'prop-types'
import { drizzleConnect } from 'drizzle-react'

import LockMakerTransaction from './LockMakerTransaction'
import LockMakerForm from './LockMakerForm'

class LockMaker extends React.Component {
  constructor (props, context) {
    super(props)

    this.unlock = context.drizzle.contracts['Unlock']
    this.createLock = this.createLock.bind(this)

    // Keeping track of the transaction to create a lock
    this.stackId = null
  }

  createLock (params) {
    this.stackId = this.unlock.methods['createLock'].cacheSend(...Object.values(params), { gas: 89499 * 10})
  }

  render () {
    let transaction = null

    if (this.stackId) {
      const transactionHash = this.props.transactionStack[this.stackId]
      transaction = this.props.transactions[transactionHash]
    }

    return (<div>
      <LockMakerForm createLock={this.createLock} />
      <LockMakerTransaction {...transaction}/>
    </div>)
  }
}

LockMaker.contextTypes = {
  drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    transactions: state.transactions,
    transactionStack: state.transactionStack
  }
}

export default drizzleConnect(LockMaker, mapStateToProps)
