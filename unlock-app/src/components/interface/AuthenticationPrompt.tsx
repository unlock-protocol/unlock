import React from 'react'

export default class AuthenticationPrompt extends React.Component {
  constructor(props: any) {
    super(props)
    this.state = {
      emailAddress: '', // eslint-disable-line react/no-unused-state
      password: '', // eslint-disable-line react/no-unused-state
    }
  }

  handleInputChange = (event: any) => {
    const { target } = event
    const { value, name } = target

    this.setState({
      [name]: value,
    })
  }

  handleSubmit = (event: any) => {
    // TODO: dispatch an event here to indicate that we have received credentials
    // TODO: handle failure -> bad password and/or email. Communicate from storageService to here so we can prompt.
    event.preventDefault()
  }

  render = () => (
    // TODO: This form needs an actual design.
    <form onSubmit={this.handleSubmit}>
      <label htmlFor="emailAddress">
        Email address:
        <input
          name="emailAddress"
          type="email"
          onChange={this.handleInputChange}
        />
      </label>
      <br />
      <label htmlFor="password">
        Password:
        <input
          name="password"
          type="password"
          onChange={this.handleInputChange}
        />
      </label>
      <br />
      <input type="submit" value="Submit" />
    </form>
  )
}
