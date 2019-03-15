import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { RoundedLogo, WordMarkLogo } from './Logo'
import Buttons from './buttons/layout'
import { ButtonLink } from './buttons/Button'
import Media from '../../theme/media'

// add new navigation buttons here, layout will reflow appropriately
const navigationButtons = [
  Buttons.About,
  Buttons.Jobs,
  Buttons.Github,
  Buttons.Telegram,
]

export const mapStateToProps = ({
  router: {
    location: { pathname },
  },
}) => ({ pathname })

export function Header({ title }) {
  const [menu, setMenu] = useState(false)
  const toggleMenu = useCallback(() => setMenu(showing => !showing), [setMenu])
  return (
    <TopHeader>
      <Title forContent>
        <Link href="/">
          <TitleLink>
            <WordMarkLogo viewBox="0 0 1200 256" height="28px" name="Unlock" />
          </TitleLink>
        </Link>
        <TitleText>{title}</TitleText>
      </Title>
      <DesktopButtons>
        {navigationButtons.map(NavButton => (
          <NavButton key={NavButton} />
        ))}
      </DesktopButtons>
      <MobileToggle visibilityToggle={!!menu} onClick={toggleMenu}>
        <Buttons.Bars size="48px" />
        <Buttons.ChevronUp size="48px" />
      </MobileToggle>
      <MobilePopover visibilityToggle={!!menu}>
        {menu
          ? navigationButtons.map(NavButton => (
              <NavButton key={NavButton} size="48px" onClick={toggleMenu} />
            ))
          : ''}
      </MobilePopover>
    </TopHeader>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  forContent: PropTypes.bool,
}

Header.defaultProps = {
  title: 'Unlock',
  forContent: false,
}

export default connect(mapStateToProps)(Header)

const TopHeader = styled.header`
  display: grid;
  grid-gap: 0;
  grid-template-columns: 1fr auto;
  grid-auto-flow: column;
  align-items: center;
  height: 70px;

  ${Media.phone`
    grid-template-columns: [first] 1fr [second] 48px;
    grid-template-rows: ${props =>
      props.visibilityToggle ? '[first] auto [second]' : '[first]'} auto;
    height: auto;
  `};
`

const TitleLink = styled.a`
  padding-bottom: 2px;
  margin-right: -8px;
`

const Title = styled.h1`
  color: var(--darkgrey);
  display: flex;
  align-items: flex-end;
  ${Media.phone`
    display: grid;
    grid-gap: 0;
    ${props =>
      props.forContent
        ? 'grid-template-columns: 123px auto;'
        : 'grid-template-columns: 50px auto;'}
  `};
`

const TitleText = styled.span`
  font-size: 32px;
  line-height: 47px;
  font-weight: 300;
`

const DesktopButtons = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: repeat(${() => navigationButtons.length}, 24px);
  grid-auto-flow: column;
  align-items: center;
  height: 100%;

  ${Media.phone`
    display: none;
  `};
`

const MobileToggle = styled.div`
  display: none;
  height: auto;
  grid-column: second;

  ${ButtonLink} {
    background-color: var(--white);
    transition: all 500ms cubic-bezier(0.165, 0.84, 0.44, 1);
    opacity: 1;
    pointer-events: visible;
    align-self: center;

    ${props => (props.visibilityToggle ? '&:nth-child(2)' : '&:nth-child(1)')} {
      pointer-events: none;
    }

    ${props => (props.visibilityToggle ? '&:nth-child(1)' : '&:nth-child(2)')} {
      pointer-events: none;
      display: none;
    }

    > svg {
      fill: var(--grey);
    }

    &:hover {
      > svg {
        fill: var(--grey);
      }
    }
  }

  ${Media.phone`
    display: grid;
  `};
  ${Media.nophone`
    display: none;
  `};
`

const MobilePopover = styled.div`
  background-color: var(--white);
  width: 100%;
  height: ${props => (props.visibilityToggle ? '0' : 'auto')};
  z-index: var(--foreground);
  padding-bottom: 30px;

  display: inline-block;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 0px;
  grid-row: second;
  grid-column-start: 1;
  grid-column-end: 3;
  align-items: center;
  justify-content: center;

  transition: all 500ms cubic-bezier(0.165, 0.84, 0.44, 1);
  ${props =>
    props.visibilityToggle
      ? 'height: 100%; pointer-events: visible; top: 70px;'
      : 'height: 0%; pointer-events: none; top: 50px;'} ${ButtonLink} {
    margin: 24px;

    small {
      display: block;
      color: var(--grey);
      text-align: center;
      top: 5px;
      width: 100%;
      text-align: center;
    }
  }

  ${Media.phone`
    display: grid;
  `};
  ${Media.nophone`
    display: none;
  `};
`

const LogoContainer = styled.div`
  ${Media.nophone`
    display: none;
  `};
  padding-top: 2px;
`
