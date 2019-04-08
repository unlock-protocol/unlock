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

  render = () => (
    <form>
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
    </form>
  )
}
