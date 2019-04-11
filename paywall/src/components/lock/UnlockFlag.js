import styled from 'styled-components'
import React, { useEffect, useState } from 'react'

import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'
import Media from '../../theme/media'
import { SHOW_FLAG_FOR } from '../../constants'

export function LockedFlag() {
  return (
    <Colophon>
      <p>Powered by</p>
      <RoundedLogo />
      <a href="/">Unlock</a>
    </Colophon>
  )
}

export const UnlockedFlag = () => {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const timeout = setTimeout(() => {
      setHidden(true)
    }, SHOW_FLAG_FOR)
    return () => clearTimeout(timeout)
  }, [setHidden])
  return (
    <Flag data-testid="unlocked" hidden={hidden}>
      <aside>
        <b>You&apos;re subscribed</b>
        <span>Valid until</span>
        <span>April 5, 2019.</span>
      </aside>
      <RoundedLogo />
      <p>Powered by</p>
      <a href="/">Unlock</a>
    </Flag>
  )
}

const Flag = styled(Colophon).attrs({
  className: 'flag',
})`
  float: right;
  grid-template-columns: 35px 1fr;
  width: 120px;
  box-shadow: 14px 0px 40px rgba(0, 0, 0, 0.08);
  background: var(--white);
  margin-right: 0;
  ${props => (props.hidden ? 'opacity: 0.5;' : 'opacity: 1;')}

  transition: opacity 0.4s ease-in;
  &:hover {
    grid-template-columns: 136px 35px 1fr;
    width: 256px;
    opacity: 1;
    transition: opacity 0.4s ease-in;
  }
  &:hover a {
    grid-column: 3;
  }
  & a {
    color: var(--red);
  }
  &:hover > p {
    grid-column: 3;
  }
  &:hover > div {
    width: 40px;
    height: 40px;
    margin-left: -20px;
    grid-column: 2;
    z-index: 2;
    border: 6px solid white;
    border-radius: 50%;
  }
  & > aside {
    grid-column: 1;
    grid-row: 1 / span 2;
    width: 136px;
    height: 80px;
    opacity: 0;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: center;
  }
  &:hover > aside {
    background-color: var(--lightgrey);
    opacity: 1;
  }

  & > aside > span {
    width: 98px;
    margin-left: 14px;
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: normal;
  }
  & > aside > b {
    display: none;
  }

  ${Media.phone`
    grid-template-columns: 1fr 1fr;
    background-color: var(--offwhite);
    align-self: center;
    justify-self: center;
    height: 43px;
    float: none;

    opacity: 1;
    & > div {
      grid-column: 2;
    }
    &:hover > div {
      border: none;
      border-radius: none;
      width: 12px;
      height: 12px;
      margin-left: 0;
    }
    & > aside {
      grid-column: 1;
      opacity: 1;
    }
      `}
`
