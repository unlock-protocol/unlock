import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

export const MembershipUnlocked = () => (
  <MembersBar>
    Thanks for being a member! Did you know? Your key is an Ethereum non
    fungible token!{' '}
    <span role="img" aria-label="click">
      🔑
    </span>
  </MembersBar>
)

export const MembershipLocked = ({ becomeMember }) => (
  <MembersBar>
    <Button onClick={becomeMember}>
      Try Unlock, become a member!{' '}
      <span role="img" aria-label="click">
        ↗️
      </span>
    </Button>
  </MembersBar>
)

MembershipLocked.propTypes = {
  becomeMember: PropTypes.func.isRequired,
}

export class Membership extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isMember: props.isMember || 'pending',
    }
    this.unlockListener = event => {
      if (event.detail === 'unlocked') {
        this.setState(state => ({
          ...state,
          isMember: 'yes',
        }))
      } else if (event.detail === 'locked') {
        this.setState(state => ({
          ...state,
          isMember: 'no',
        }))
      }
    }
  }

  componentDidMount() {
    window.addEventListener('unlockProtocol', this.unlockListener)
  }

  componentWillUnmount() {
    window.removeEventListener('unlockProtocol', this.unlockListener)
  }

  becomeMember() {
    window.unlockProtocol && window.unlockProtocol.loadCheckoutModal()
  }

  render() {
    const { isMember } = this.state
    if (isMember === 'yes') {
      return <MembershipUnlocked />
    }
    return <MembershipLocked becomeMember={this.becomeMember} />
  }
}

Membership.propTypes = {
  isMember: PropTypes.string,
}

Membership.defaultProps = {
  isMember: 'pending',
}

export default Membership

const MembersBar = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-content: center;
  align-content: center;
  background-color: black;
  width: 100%;
  left: 0px;
  position: fixed;
  padding: 15px;
  bottom: 0;
  text-align: center;
`

const Button = styled.div`
  cursor: pointer;
  padding: 10px;
`
