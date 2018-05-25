import UnlockPropTypes from '../../propTypes'

import React from 'react'

import { unlockIfKeyIsValid } from '../../services/iframeService'

export function Key({ currentKey }) {
  return (
    <div className="card-body">
      <h5 className="card-title">Members only</h5>
      <p className="card-text">Your key expires at {currentKey.expiration}.</p>
      <button className="btn btn-primary" color="primary" onClick={() => { unlockIfKeyIsValid({ key: currentKey }) }}>Close</button>
    </div>)
}

Key.propTypes = {
  currentKey: UnlockPropTypes.key,
}

export default Key