import styled from 'styled-components'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

import { Colophon } from './LockStyles'
import { RoundedLogo } from '../interface/Logo'
import Media from '../../theme/media'
import { SHOW_FLAG_FOR } from '../../constants'

export function LockedFlag() {
  return (
    <Colophon>
      <p>Powered by</p>
      <RoundedLogo />
      <a href="/" target="_blank">
        Unlock
      </a>
    </Colophon>
  )
}

export const UnlockedFlag = ({ expiration }) => {
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
        <span>
          <b>You&apos;re subscribed</b>
        </span>
        <div>
          <span>Valid until</span>
          <span>{expiration}.</span>
        </div>
      </aside>
      <RoundedLogo />
      <p>Powered by</p>
      <a href="/" target="_blank">
        Unlock
      </a>
    </Flag>
  )
}

UnlockedFlag.propTypes = {
  expiration: PropTypes.string.isRequired,
}

export default UnlockedFlag

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

  & > aside {
    font-family: Roboto;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: normal;
  }
  & > aside > span > b {
    display: none;
  }
  & > aside > div {
    display: flex;
    flex-direction: column;
    width: 98px;
    margin-left: 14px;
  }

  ${Media.phone`
    &, &:hover {
      grid-template-columns: 1fr 0.6fr 20px 0.4fr;
      grid-template-rows: 30px 30px;
      width: 100vw;
      opacity: 1;
      background-color: var(--offwhite);
      align-self: center;
      justify-self: center;
      height: 60px;
      float: none;

      & > p {
        grid-column: 2;
      }
      & > div {
        grid-column: 3;
      }
      & > a {
        grid-column: 4;
      }
      & > aside {
        grid-row: 1 / span 2;
      }
      & > p, & > div, & > a {
        grid-row: 2;
        align-self: start;
      }

      & > div {
        height: 16px;
        width: 16px;
        border: none;
        margin-left: 0;
      }
      & > aside {
        display: grid;
        padding: 0;
        margin: 0;
        grid-row: 1 / span 2;
        height: 100%;
        width: 100%;
        background-color: var(--offwhite);
        width: 100%;
        opacity: 1;
        & > span > b {
          margin-left: 14px;
          display: block;
        }
        & > div {
          width: 100%;
          display: flex;
          flex-direction: row;
          width: auto;
          & > span {
            padding-right: 3px;
          }
        }
      }
    }
  `}
`
