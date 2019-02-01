import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { LOCK_PATH_NAME_REGEXP } from '../constants'
import DemoComponent from '../components/interface/Demo'

/**
 * This is the actual demo page with JS which injects a paywall'ed iframe.
 * @param {*} lock
 * @param {*} domain
 */
const Demo = ({ lock, domain }) => {
  return (
    <DemoComponent>
      <script src="/static/paywall.min.js" data-unlock-url={domain} />
      {lock && <meta name="lock" content={lock} />}
    </DemoComponent>
  )
}

Demo.propTypes = {
  lock: PropTypes.string,
  domain: PropTypes.string.isRequired,
}

Demo.defaultProps = {
  lock: '',
}

export const mapStateToProps = ({ router }) => {
  const match = router.location.pathname.match(LOCK_PATH_NAME_REGEXP)
  const lock = match ? match[1] : null
  const domain =
    global.document && document.location
      ? document.location.protocol + '//' + document.location.host
      : ''
  return {
    lock,
    domain,
  }
}

export default connect(mapStateToProps)(Demo)
