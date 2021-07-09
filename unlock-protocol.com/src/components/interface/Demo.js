import PropTypes from 'prop-types'

import styled from 'styled-components'
import React, { useContext } from 'react'
import Svg from './svg'
import { Columns, Column } from './LandingPageComponents'
import { MembershipContext } from '../../membershipContext'

const Pending = () => (
  <Loading>
    <Svg.Loading />
  </Loading>
)

const NotAMember = ({ becomeMember }) => (
  <div
    style={{
      position: 'relative',
    }}
  >
    <img alt="members-only" src="/static/images/illustrations/blurred.png" />
    <Button onClick={becomeMember}>Unlock!</Button>
  </div>
)

NotAMember.propTypes = {
  becomeMember: PropTypes.func.isRequired,
}

const AMember = () => (
  <Columns>
    <Column>
      <div style={{ width: '100%', padding: '8px' }}>
        <img
          alt="chanels"
          style={{ maxWidth: '64px' }}
          src="/static/images/illustrations/members-channels.svg"
        />
      </div>
      Join our members-only channels
    </Column>
    <Column>
      <div style={{ width: '100%', padding: '8px' }}>
        <img
          alt="hoodie"
          style={{ maxWidth: '64px' }}
          src="/static/images/illustrations/hoodie.png"
        />
      </div>
      Merbers-only merchandise
    </Column>
    <Column>
      <div style={{ width: '100%', padding: '8px' }}>
        <img
          alt="blog"
          style={{ maxWidth: '64px' }}
          src="/static/images/illustrations/blog-chatter.png"
        />
      </div>
      Comment on our blog
    </Column>
  </Columns>
)

export const Demo = () => {
  const { isMember, becomeMember } = useContext(MembershipContext)

  return (
    <Wrapper>
      {isMember === 'no' && <NotAMember becomeMember={becomeMember} />}
      {isMember === 'yes' && <AMember />}
      {isMember === 'pending' && <Pending />}
    </Wrapper>
  )
}

Demo.propTypes = {}

export default Demo

const Loading = styled.div`
  width: 50%;
  svg {
    fill: var(--silver);
  }
`

const Wrapper = styled.section`
  text-align: center;
`

const Button = styled.button`
  background: var(--green);
  color: var(--white);
  font-size: 16px;
  padding: 16px;
  width: 50%;
  border: none;
  position: absolute;
  top: 33%;
  left: 25%;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: var(--activegreen);
  }
`
