import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query'

const urlPropsQueryConfig = {
  address: { type: UrlQueryParamTypes.string },
  symbol: { type: UrlQueryParamTypes.string },
  amount: { type: UrlQueryParamTypes.number },
}

class Modal extends Component {

  static propTypes = {
    address: PropTypes.string,
    symbol: PropTypes.string,
    amount: PropTypes.number,
  }

  static defaultProps = {
    address: '0xdeadbeef',
    symbol: 'Ether',
    amount: 1,
  }
  
  render() {
    return (
      <section className="modal">
        <h1>Unlock</h1>
        <p>This content is locked! to unlock it, send {this.props.amount} {this.props.symbol} to {this.props.address} from your address in Unlock.</p>
      </section>
    )
  }
}

export default addUrlProps({ urlPropsQueryConfig })(Modal);

