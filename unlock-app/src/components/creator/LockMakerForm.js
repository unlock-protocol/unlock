import React from 'react'
import { Button, Form, FormGroup, Label, Input } from 'reactstrap'
import { Row, Col } from 'reactstrap'

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
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({ [event.target.id]: event.target.value })
  }

  handleSubmit () {
    this.props.createLock(this.state)
  }

  render () {
    return (<Row>
      <Col>
        <h1>New Lock</h1>
        <Form>
          <FormGroup>
            <Label for="keyReleaseMechanism">Key Release Mechanism</Label>
            <Input type="select" value={this.state.keyReleaseMechanism} onChange={this.handleChange} id="keyReleaseMechanism">
              <option value="0">Public</option>
              <option value="1">Permissioned</option>
              <option value="2">Private</option>
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="keyPrice">Key Price (Wei)</Label>
            <Input
              type="number"
              id="keyPrice"
              value={this.state.keyPrice}
              onChange={this.handleChange} />
          </FormGroup>

          <FormGroup>
            <Label for="maxNumberOfKeys">Max number of keys</Label>
            <Input
              type="number"
              id="maxNumberOfKeys"
              value={this.state.maxNumberOfKeys}
              onChange={this.handleChange} />
          </FormGroup>

          <Button key="submit" color="primary" onClick={this.handleSubmit}>Submit</Button>
        </Form>
      </Col>
    </Row>)
  }
}

export default LockMakerForm
