import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import getConfig from 'next/config'
import Signature from './Signature'
import Media from '../../theme/media'

const Footer = () => (
  <Container>
    <Signature />
    <Nav>
      <ul>
        <li>
          <span>App</span>
        </li>
        <li>
          <a href={`${getConfig().publicRuntimeConfig.unlockApp}/dashboard`}>
            Creator Dashboard
          </a>
        </li>
        <li>
          <a href={`${getConfig().publicRuntimeConfig.unlockApp}/keychain`}>
            Memberships
          </a>
        </li>
      </ul>
      <ul>
        <li>
          <span>Community</span>
        </li>
        <li>
          <a href="https://discord.gg/Ah6ZEJyTDp">Discord</a>
        </li>
        <li>
          <a href="https://unlock.community">Forum</a>
        </li>
        <li>
          <a href="https://vote.unlock-protocol.com">Governance</a>
        </li>
        <li>
          <a href="https://github.com/unlock-protocol/unlock">Github</a>
        </li>
        <li>
          <a href="https://twitter.com/unlockProtocol">Twitter</a>
        </li>
      </ul>
      <ul>
        <li>
          <Link href="/about">
            <a>About</a>
          </Link>
        </li>
        <li>
          <Link href="/blog">
            <a>Blog</a>
          </Link>
        </li>
        <li>
          <a href="https://docs.unlock-protocol.com/creators/plugins-and-integrations">
            Integrations
          </a>
        </li>
        <li>
          {/* TODO: Replace withh developer landing page when available */}
          <a href="https://github.com/unlock-protocol/unlock">Developers</a>
        </li>
        <li>
          <a href="https://docs.unlock-protocol.com/">Docs</a>
        </li>
      </ul>
    </Nav>
    <Colophon>Made with passion for the web!</Colophon>
  </Container>
)

export default Footer

const Container = styled.footer`
  background-color: var(--white);
  border-radius: 4px;
  padding: 32px;
  padding-top: 32px;
  margin-top: 104px;
  margin-bottom: 0px;
  display: flex;
  flex-direction: column;
`

const Colophon = styled.span`
  justify-self: end;
  font-size: 12px;
  font-weight: 300;
  font-style: italic;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  text-align: right;
  margin-top: 32px;
`

const Nav = styled.nav`
  margin-top: 64px;
  display: flex;
  flex-direction: column;

  ${Media.phone`
    display: none;
  `}

  ul {
    margin: 0px;
    padding: 0px;
    list-style: none;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    ${Media.phone`
      /* flex-direction: column; */
    `}

    li {
      font-weight: 500;
      margin-right: 16px;
    }

    a,
    span {
      display: inline-block;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    span {
      background-color: var(--lightgrey);
      color: var(--grey);
    }

    a {
      background-color: var(--link);
      color: var(--white);
      transition: background-color 400ms ease;

      :hover {
        background-color: #2768c8;
      }
    }
  }
`
