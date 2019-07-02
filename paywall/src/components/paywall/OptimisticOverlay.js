import { connect } from 'react-redux'
import React from 'react'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../../propTypes'
import { hideModal } from '../../actions/modal'

import ConfirmedFlag from './ConfirmedFlag'
import ConfirmingFlag from './ConfirmingFlag'

export const OptimisticOverlay = ({
  locks,
  hideModal,
  requiredConfirmations,
  transaction,
  optimism,
  keyStatus,
}) => {
  if (!optimism.current || ['expired', 'none'].includes(keyStatus)) {
    return null
  }
  if (keyStatus === 'confirmed' || keyStatus === 'valid') {
    return <ConfirmedFlag dismiss={hideModal} />
  }
  return (
    <ConfirmingFlag
      transaction={transaction}
      lock={locks[0]}
      requiredConfirmations={requiredConfirmations}
    />
  )
}

OptimisticOverlay.propTypes = {
  locks: PropTypes.arrayOf(UnlockPropTypes.lock).isRequired,
  hideModal: PropTypes.func.isRequired,
  requiredConfirmations: PropTypes.number.isRequired,
  transaction: UnlockPropTypes.transaction,
  optimism: PropTypes.shape({
    current: PropTypes.oneOf([0, 1]).isRequired,
    past: PropTypes.oneOf([0, 1]).isRequired,
  }).isRequired,
  keyStatus: PropTypes.string.isRequired,
}

OptimisticOverlay.defaultProps = {
  transaction: null,
}

export const mapDispatchToProps = (dispatch, { locks }) => ({
  hideModal: () => {
    dispatch(hideModal(locks.map(l => l.address).join('-')))
  },
})

export default connect(
  undefined, // mapStateToProps is unneeded for this component
  mapDispatchToProps
)(OptimisticOverlay)
