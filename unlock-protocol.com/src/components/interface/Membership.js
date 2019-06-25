import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { MembershipContext } from '../../membershipContext'

export const MembershipUnlocked = () => (
  <MembersBar>
    Thanks for being a member! Did you know? Your key{' '}
    <span role="img" aria-label="click">
      🔑
    </span>{' '}
    is an Ethereum non fungible token!{' '}
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
  static contextType = MembershipContext

  render() {
    const { isMember, becomeMember } = this.context
    if (isMember === 'yes') {
      return <MembershipUnlocked />
    }
    if (isMember === 'no') {
      return <MembershipLocked becomeMember={becomeMember} />
    }
    return null
  }
}

export default Membership

const MembersBar = styled.div`
  justify-content: center;
  align-content: center;
  background-color: black;
  width: 100%;
  left: 0px;
  position: fixed;
  padding: 15px;
  bottom: 0;
  text-align: center;
  z-index: 1000; /* Commento's comment box would show above */
`

const Button = styled.div`
  cursor: pointer;
  padding: 10px;
`
