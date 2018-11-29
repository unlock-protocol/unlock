import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'
import { showModal } from '../../actions/modal'

export const ShowUnlessUserHasKeyToAnyLock = ({
  keys,
  modalShown,
  showModal,
  children,
}) => {
  // We have at least one valid key and the modal was not shown
  if (keys.length > 0 && !modalShown) {
    return null
  }

  // There is a valid key, but we shown the modal previously
  if (keys.length > 0 && !!modalShown) {
    return children
  }

  // There is no valid key, but the modal has not been set so we set it
  if (!modalShown) {
    showModal()
  }
  return children
}

ShowUnlessUserHasKeyToAnyLock.propTypes = {
  modalShown: PropTypes.bool,
  locks: UnlockPropTypes.locks,
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  children: PropTypes.node,
}

export const mapDispatchToProps = (dispatch, { locks }) => ({
  showModal: () => dispatch(showModal(Object.keys(locks).join('-'))),
})

export const mapStateToProps = ({ keys, modals }, { locks }) => {
  let validKeys = []
  const now = new Date().getTime() / 1000
  for (let lock of Object.values(locks)) {
    for (let k of Object.values(keys)) {
      if (k.lockAddress === lock.address && k.expiration > now) {
        validKeys.push(k)
      }
    }
  }

  return {
    modalShown: !!modals[Object.keys(locks).join('-')],
    keys: validKeys,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowUnlessUserHasKeyToAnyLock)
