import UnlockPropTypes from '../../propTypes'
import React from 'react'
import Duration from '../helpers/Duration'

import { unlockIfKeyIsValid } from '../../services/iframeService'

export function Key({ currentKey }) {
  const secondsToExpiration =
    currentKey.expiration - Math.floor(new Date().getTime()/1000)

  return (
    <div className="card-body">
      <h5 className="card-title">Members only</h5>
      <p className="card-text">Your key expires in <Duration seconds={secondsToExpiration.toString(10)} />.</p>
      <button className="btn btn-primary" color="primary" onClick={() => { unlockIfKeyIsValid({ key: currentKey }) }}>Close</button>
    </div>)
}

Key.propTypes = {
  currentKey: UnlockPropTypes.key,
}

export default Key