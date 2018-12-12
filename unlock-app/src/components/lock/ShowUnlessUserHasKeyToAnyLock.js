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
    window.parent.postMessage('unlocked', '*')
    return children
  }

  // There is no valid key, but the modal has not been set so we set it
  if (!modalShown) {
    showModal()
  }
  return children
}

ShowUnlessUserHasKeyToAnyLock.propTypes = {
  keys: PropTypes.arrayOf(UnlockPropTypes.key),
  showModal: PropTypes.func,
  modalShown: PropTypes.bool,
  children: PropTypes.node,
}

export const mapDispatchToProps = (dispatch, { locks }) => ({
  showModal: () => {
    window.parent.postMessage('locked', '*')
    dispatch(showModal(locks.map(l => l.address).join('-')))
  },
})

export const mapStateToProps = ({ keys, modals }, { locks }) => {
  let validKeys = []
  const now = new Date().getTime() / 1000
  locks.forEach(lock => {
    for (let k of Object.values(keys)) {
      if (k.lock === lock.address && k.expiration > now) {
        validKeys.push(k)
      }
    }
  })

  return {
    modalShown: !!modals[locks.map(l => l.address).join('-')],
    keys: validKeys,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ShowUnlessUserHasKeyToAnyLock)
