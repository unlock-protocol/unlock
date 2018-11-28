import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Svg from './svg'
import Buttons from './buttons/layout'
import { ButtonLink } from './buttons/Button'

export default class Header extends React.PureComponent {
  constructor(props) {
    super(props)
    this.forContent = props.forContent
    this.title = props.title
    this.toggleMenu = this.toggleMenu.bind(this)
    this.state = { menu: false }
  }

  toggleMenu() {
    this.setState(prevState => ({ menu: !prevState.menu }))
  }

  render() {
    const { menu } = this.state

    return (
      <TopHeader>
        {!this.forContent && <Title>{this.title}</Title>}
        {!!this.forContent && (
          <Link href="/">
            <a>
              <Svg.UnlockWordMark height="28px" width="100%" name="Unlock" />
            </a>
          </Link>
        )}
        <DesktopButtons>
          <Buttons.About />
          <Buttons.Jobs />
          <Buttons.Github />
        </DesktopButtons>
        <MobileToggle visibilityToggle={menu ? true : false}>
          <Buttons.Bars onClick={this.toggleMenu} size="48px" />
          <Buttons.ChevronUp onClick={this.toggleMenu} size="48px" />
        </MobileToggle>
        <MobilePopover visibilityToggle={menu ? true : false}>
          <Buttons.About size="48px" />
          <Buttons.Jobs size="48px" />
          <Buttons.Github size="48px" />
        </MobilePopover>
      </TopHeader>
    )
  }
}

Header.propTypes = {
  title: PropTypes.string,
  forContent: PropTypes.bool,
}

Header.defaultProps = {
  title: 'Unlock',
  forContent: false,
}

const TopHeader = styled.header`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr repeat(3, 24px);
  grid-auto-flow: column;
  align-items: center;
  height: 70px;

  @media (max-width: 600px) {
    display: flex;
  }
`

const Title = styled.h1`
  color: var(--grey);
`

const DesktopButtons = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr repeat(3, 24px);
  grid-auto-flow: column;
  align-items: center;
  height: 100%;

  @media (max-width: 600px) {
    display: none;
  }
`

const MobileToggle = styled.div`
  display: none;
  flex-direction: row;
  align-items: center;
  height: 100%;

  ${ButtonLink} {
    position: absolute;
    right: 5px;
    top: 0px;

    background-color: var(--white);
    padding: 15px;

    transition: all 500ms cubic-bezier(0.165, 0.84, 0.44, 1);
    opacity: 1;
    pointer-events: visible;

    ${props => (props.visibilityToggle ? '&:nth-child(1)' : '&:nth-child(2)')} {
      top: -25px;
      opacity: 0;
      pointer-events: none;
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

  @media (max-width: 600px) {
    display: block;
  }
`

const MobilePopover = styled.div`
  background-color: var(--white);
  position: absolute;
  left: 0;
  top: 70px;
  width: 100%;
  height: auto;
  z-index: var(--foreground);
  padding-bottom: 30px;

  display: none;
  grid-template-columns: 92px 92px 92px;
  grid-gap: 0px;
  align-items: center;
  justify-content: center;

  transition: all 500ms cubic-bezier(0.165, 0.84, 0.44, 1);
  ${props =>
    props.visibilityToggle
      ? 'opacity: 1; pointer-events: visible; top: 70px;'
      : 'opacity: 0; pointer-events: none; top: 50px;'} ${ButtonLink} {
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

  @media (max-width: 600px) {
    display: grid;
  }
`
