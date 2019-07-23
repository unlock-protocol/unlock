import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { RoundedLogo, WordMarkLogo } from './Logo'
import Buttons from './buttons/layout'
import PageNavButtons from './buttons/navigation'
import { ButtonLink } from './buttons/Button'
import Media from '../../theme/media'

// add new navigation buttons here, layout will reflow appropriately
const navigationButtons = [
  Buttons.About,
  Buttons.Jobs,
  Buttons.Github,
  Buttons.Telegram,
]

// distinct from the above buttons are page nav buttons -- they are only visible
// from within the app and not from the homepage or other static pages.
const appButtons = [
  { Button: PageNavButtons.Dashboard, page: '/dashboard' },
  { Button: PageNavButtons.Log, page: '/log' },
  { Button: PageNavButtons.Settings, page: '/settings' },
  { Button: PageNavButtons.KeyChain, page: '/keychain' },
]

export const mapStateToProps = ({
  router: {
    location: { pathname },
  },
}) => ({ pathname })

/**
 * Helper function which returns the path on the button if the current pathname matches it
 */
export const isOnAppPage = pathname => {
  return (
    appButtons.map(button => button.page).find(page => pathname.match(page)) ||
    false
  )
}
export class Header extends React.PureComponent {
  constructor(props) {
    super(props)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.state = { menu: false }
  }

  toggleMenu() {
    this.setState(prevState => ({ menu: !prevState.menu }))
  }

  render() {
    const { menu } = this.state
    const { forContent, title, pathname } = this.props
    const onAppPage = isOnAppPage(pathname)
    return (
      <TopHeader>
        {forContent ? (
          <Link href="/">
            <a>
              <WordMarkLogo
                viewBox="0 0 1200 256"
                height="28px"
                name="Unlock"
              />
            </a>
          </Link>
        ) : (
          <Title>
            <LogoContainer>
              <Link href="/">
                <a>
                  <RoundedLogo size="30px" />
                </a>
              </Link>
            </LogoContainer>
            {title}
          </Title>
        )}
        <AppButtons>
          {onAppPage &&
            appButtons.map(({ Button }) => (
              <Button key={Button} activePath={onAppPage} />
            ))}
        </AppButtons>
        <DesktopButtons>
          {navigationButtons.map((NavButton, index) => (
            <NavButton key={index.toString()} />
          ))}
        </DesktopButtons>
        <MobileToggle visibilityToggle={!!menu} onClick={this.toggleMenu}>
          <Buttons.Bars size="48px" />
          <Buttons.ChevronUp size="48px" />
        </MobileToggle>
        <MobilePopover visibilityToggle={!!menu}>
          {menu
            ? navigationButtons.map(NavButton => (
                <NavButton
                  key={NavButton}
                  size="48px"
                  onClick={this.toggleMenu}
                />
              ))
            : ''}
        </MobilePopover>
      </TopHeader>
    )
  }
}

Header.propTypes = {
  title: PropTypes.string,
  forContent: PropTypes.bool,
  pathname: PropTypes.string,
}

Header.defaultProps = {
  title: 'Unlock',
  forContent: false,
  pathname: '/',
}

export default connect(mapStateToProps)(Header)

const TopHeader = styled.header`
  display: grid;
  grid-gap: 0;
  grid-template-columns: 256px 1fr auto;
  column-gap: 16px;
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

const Title = styled.h1`
  color: var(--grey);
  ${Media.phone`
    display: grid;
    grid-gap: 0;
    grid-template-columns: 50px auto;
  `};
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

const AppButtons = styled(DesktopButtons)`
  grid-template-columns: repeat(${() => appButtons.length}, 24px);
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
