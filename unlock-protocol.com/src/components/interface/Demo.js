import PropTypes from 'prop-types'

import styled from 'styled-components'
import React, { useContext } from 'react'
import Svg from './svg'

import Media from '../../theme/media'
import { MembershipContext } from '../../membershipContext'

const Pending = () => (
  <Lock>
    <Loading>
      <Svg.Loading />
    </Loading>
  </Lock>
)

const NotAMember = ({ becomeMember }) => (
  <Lock>
    <LockBody onClick={becomeMember}>
      <LockPrice>$0.00</LockPrice>
      <LockDuration>1 Month</LockDuration>
      <Purchase>Purchase</Purchase>
    </LockBody>
  </Lock>
)

NotAMember.propTypes = {
  becomeMember: PropTypes.func.isRequired,
}

const AMember = () => (
  <Lock>
    <Check>
      <Svg.Checkmark />
    </Check>
  </Lock>
)

export const Demo = () => {
  const { isMember, becomeMember } = useContext(MembershipContext)

  let details =
    'Become an Unlock member, experience the power of Unlock and enjoy some special member only features.'
  if (isMember === 'yes') {
    details =
      'Thanks for being an Unlock Member! Your wallet now includes your unique Unlock key!'
  }

  return (
    <Wrapper>
      {isMember === 'no' && <NotAMember becomeMember={becomeMember} />}
      {isMember === 'yes' && <AMember />}
      {isMember === 'pending' && <Pending />}
      <Details>{details}</Details>
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

const Check = styled.div`
  background-color: var(--green);
  width: 88px;
  height: 88px;
  border-radius: 44px;
  svg {
    fill: white;
  }
`

const Wrapper = styled.section`
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  padding: 20px;
  display: grid;
  max-width: 600px;
  ${Media.nophone`
    grid-template-columns: 200px 1fr;
  `};
`

const Lock = styled.div`
  text-align: center;
  font-size: 20px;
  line-height: 26px;
  color: var(--grey);
  font-weight: 300;
  display: grid;
  align-items: center;
  justify-items: center;
`

const LockBody = styled.div`
  margin: 10px;
  border: 2px solid var(--green);
  border-radius: 4px;
  width: 180px;
  cursor: pointer;
`

const LockPrice = styled.div`
  font-weight: bold;
  font-size: 30px;
  line-height: 39px;
  margin: 10px;
  color: var(--slate);
`
const LockDuration = styled.div`
  font-size: 20px;
  line-height: 26px;
  font-weight: 300;
  color: var(--grey);
  margin: 7px;
`
const Purchase = styled.div`
  background: var(--green);
  color: var(--white);
  font-size: 20px;
  line-height: 26px;
  padding: 5px;
`

const Details = styled.div`
  padding: 20px;
  font-weight: 300;
  font-size: 20px;
  line-height: 28px;
`
