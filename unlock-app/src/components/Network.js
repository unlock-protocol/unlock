import PropTypes from 'prop-types'
import UnlockPropTypes from '../propTypes'

import React from 'react'
import { connect } from 'react-redux'
import { setNetwork } from '../actions/network'

export const Network = (props) => {
  return (
    <input type="select" value={props.network} onChange={(event) => props.setNetwork(event.target.value)}>
      {Object.keys(props.networks).map((name, i) => {
        return (<option value={name} key={i}>{props.networks[name].name}</option>)
      })}
    </input>
  )
}

Network.propTypes = {
  network: UnlockPropTypes.network,
  setNetwork: PropTypes.func,
  networks: UnlockPropTypes.networks,
}

const mapStateToProps = state => {
  return {
    network: state.network,
    networks: state.networks,
  }
}

const mapDispatchToProps = dispatch => ({
  setNetwork: account => dispatch(setNetwork(account)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Network)
