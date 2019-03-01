import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import UnlockPropTypes from '../propTypes'
import DemoComponent from '../components/interface/Demo'
import { lockRoute } from '../utils/routes'
import withConfig from '../utils/withConfig'

/**
 * This is the actual demo page with JS which injects a paywall'ed iframe.
 * @param {*} lock
 * @param {*} domain
 */
const Demo = ({ lock, config: { paywallUrl, paywallScriptUrl } }) => {
  return (
    <DemoComponent>
      <script src={paywallScriptUrl} data-unlock-url={paywallUrl} />
      {lock && <meta name="lock" content={lock} />}
    </DemoComponent>
  )
}

Demo.propTypes = {
  lock: PropTypes.string,
  config: UnlockPropTypes.configuration.isRequired,
}

Demo.defaultProps = {
  lock: '',
}

export const mapStateToProps = ({ router }) => {
  const { lockAddress } = lockRoute(router.location.pathname)
  return {
    lock: lockAddress,
  }
}

export default withConfig(connect(mapStateToProps)(Demo))
