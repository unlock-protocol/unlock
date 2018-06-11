import React, { Component } from 'react'
import Link from 'gatsby-link'
import ReCAPTCHA from 'react-google-recaptcha'

class OptinForm extends Component {

  constructor(props, context) {
    super(props)
    this.state = {
      email: '',
      recaptcha: null,
      form: null
    }
    this.handleChange = this.handleChange.bind(this)
    this.submitEmail = this.submitEmail.bind(this)
    this.verifyCallback = this.verifyCallback.bind(this)
    this.setRecaptcha = this.setRecaptcha.bind(this)
  }

  setRecaptcha(target) {
    this.setState({ recaptcha: target })
  }

  handleChange(event) {
    this.setState({ email: event.target.value });
  }

  submitEmail(event) {
    event.preventDefault()
    this.setState({form: event.target})
    this.state.recaptcha.execute()
  }

  verifyCallback() {
    this.state.form.submit()
  }

 render() {
   return (<div>
     <ReCAPTCHA
       ref={this.setRecaptcha}
       size="invisible"
       sitekey="6LfuZF4UAAAAANz9dvVjCxzX-i2w7HOuV5_hq_Ir"
       onChange={this.verifyCallback}
     />

     <form action="https://unlock-protocol.us17.list-manage.com/subscribe/post?u=557de63fe04b1fc4212f4ffab&amp;id=6764cd60ef" method="post" className="subscribe" onSubmit={this.submitEmail}>
        <input
          type="email"
          className="subscribe__input"
          placeholder="Subscribe to be notified when we launch"
          value={this.state.email}
          onChange={this.handleChange}
          id="mce-EMAIL"
         name="EMAIL"
          required
        />
        <input type="submit" className="subscribe__button js-cm-submit-button" value="" />

      </form>
    </div>)
 }
}

export default OptinForm
