import styled from 'styled-components'
import React from 'react'

import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'
import Media from '../../theme/media'
import { SHOW_FLAG_FOR } from '../../constants'

export function LockedFlag() {
  return (
    <Colophon>
      <RoundedLogo size="28px" />
      <p>Powered by Unlock</p>
    </Colophon>
  )
}

export class UnlockedFlag extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hidden: false,
    }
  }

  componentDidMount() {
    setTimeout(() => this.setState({ hidden: true }), SHOW_FLAG_FOR)
  }

  render() {
    const { hidden } = this.state
    return (
      <Flag hidden={hidden}>
        <RoundedLogo size="28px" />
        <p>Subscribed with Unlock</p>
      </Flag>
    )
  }
}

const Flag = styled(Colophon)`
  float: right;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  opacity: 0.5;
  margin-right: -106px;
  transition: opacity 0.4s ease-in, margin-right 0.4s ease-in;

  ${props =>
    props.hidden
      ? ''
      : `
  opacity: 1;
  margin-right: 0;
`}

  &:hover {
    opacity: 1;
    margin-right: 0;
    transition: opacity 0.4s ease-in, margin-right 0.4s ease-in;
  }

  ${Media.phone`
    display: none;
  `}
`
