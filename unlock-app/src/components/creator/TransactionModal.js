import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

import { connect } from 'react-redux'

import React from 'react'
import NetworkBadge from '../interface/NetworkBadge'

export function TransactionModal({ hideTransactionModal, transaction }) {
  if (!transaction) {
    return null
  }
  return (<div>
    <NetworkBadge/>
    <div className="modal-dialog" role="document">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Deploying lock...</h5>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => hideTransactionModal()}>
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal-body">
          <p>Your lock is being deployed on the blockchain. It may take up to a couple of minutes to deploy your lock on all Ethereum nodes. We also recommend that you wait for 12 confirmations if you want to have a very strong confidence that your lock has been deployed.</p>
          <p>State: {transaction.status}</p>
          <p>Confirmations: {transaction.confirmations}</p>
          {transaction.lock &&
            <p>Your lock has been deployed at {transaction.lock.address}</p>
          }
        </div>
      </div>
    </div>
  </div>)
}

TransactionModal.propTypes = {
  hideTransactionModal: PropTypes.func,
  transaction: UnlockPropTypes.transaction,
}

const mapStateToProps = state => {
  return {
    transaction: state.transactions.latest,
  }
}

const mapDispatchToProps = dispatch => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(TransactionModal)
