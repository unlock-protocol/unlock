import web3 from 'web3'
import React from 'react'

class LockMakerForm extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      keyReleaseMechanism: 0, // Public
      expirationDuration: 60 * 60 * 24 * 10, // 10 days (in seconds!)
      expirationTimestamp: 0, // for now 0 as we focus on duration based locks
      keyPriceCalculator: 0, // let's focus on fix prices
      keyPrice: 100000, // we should show a better UI to let creators set their price in eth!
      maxNumberOfKeys: 10
    }
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit () {
    this.props.createLock(this.state)
  }

  render () {
    return (<form>
      <button key="submit" type="button" onClick={this.handleSubmit}>Submit</button>
    </form>)
  }
}

export default LockMakerForm
