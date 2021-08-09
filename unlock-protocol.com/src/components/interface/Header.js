import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { WordMarkLogo } from './Logo'
import Buttons from './buttons/layout'
import { BaseButton } from './buttons/LayoutButton'
import Media from '../../theme/media'

// add new navigation buttons here, layout will reflow appropriately
const navigationButtons = [
  Buttons.About,
  Buttons.Blog,
  Buttons.Integrations,
  Buttons.Developers,
  Buttons.Docs,
  Buttons.Discord,
  Buttons.App,
]

export class Header extends React.PureComponent {
  constructor(props) {
    super(props)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.state = { menu: false }
  }

  toggleMenu() {
    this.setState((prevState) => ({ menu: !prevState.menu }))
  }

  render() {
    return (
      <TopHeader>
        <LogoWrapper>
          <Link href="/">
            <a style={{ display: 'flex', alignItems: 'center' }}>
              <WordMarkLogo
                viewBox="0 0 1200 256"
                height="28px"
                name="Unlock"
              />
            </a>
          </Link>
        </LogoWrapper>

        <DesktopButtons>
          {navigationButtons.map((NavButton) => (
            <NavButton key={NavButton} />
          ))}
        </DesktopButtons>
      </TopHeader>
    )
  }
}

Header.propTypes = {}

Header.defaultProps = {}

export default Header

const TopHeader = styled.header`
  display: flex;
  width: 100%;
  margin-bottom: 64px;
  justify-content: space-between;
  ${Media.phone`
    flex-direction: column;
    margin-bottom: 16px;
    padding: 16px;
  `};
  ${Media.tablet`
    flex-direction: column;
  `};
`

const DesktopButtons = styled.div`
  display: flex;
  justify-items: end;
  height: 100%;
  overflow-x: scroll;
  margin-top: 16px;

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */

  &::-webkit-scrollbar {
    /* WebKit */
    width: 0;
    height: 0;
  }

  ${BaseButton}:first-child {
    margin-left: 0px;
  }
`

const LogoWrapper = styled.div`
  align-content: center;
  display: flex;
`
