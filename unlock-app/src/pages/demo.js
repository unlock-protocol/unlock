import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import DemoComponent from '../components/interface/Demo'
import { lockRoute } from '../utils/routes'

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
  const { lockAddress } = lockRoute(router.location.pathname)
  const domain =
    global.document && document.location
      ? document.location.protocol + '//' + document.location.host
      : ''
  return {
    lock: lockAddress,
    domain,
  }
}

export default connect(mapStateToProps)(Demo)
