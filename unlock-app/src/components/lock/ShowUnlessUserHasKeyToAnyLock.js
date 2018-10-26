import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import UnlockPropTypes from '../../propTypes'

export const ShowUnlessUserHasKeyToAnyLock = ({ locks, keys, children }) => {
  const now = new Date().getTime() / 1000
  for(let lock of locks) {
    for(let key of Object.values(keys)) {
      if (
        key.lockAddress === lock.address
        && key.expiration > now
      ) {
        return null
      }
    }
  }

  return children
}

ShowUnlessUserHasKeyToAnyLock.propTypes = {
  locks: UnlockPropTypes.locks,
  keys: UnlockPropTypes.keys,
  children: PropTypes.node,
}

const mapStateToProps = state => {
  return {
    keys: state.keys,
  }
}

export default connect(mapStateToProps)(ShowUnlessUserHasKeyToAnyLock)
