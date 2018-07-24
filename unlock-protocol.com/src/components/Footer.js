import React from 'react'
import Link from 'gatsby-link'
import logo from './../assets/images/logo.svg'
import * as FontAwesome from 'react-icons/lib/fa'

const Footer = ({ siteTitle }) => (
  <footer className="footer">
    <p>© 2018 Unlock Inc</p>
    <ul>
      <li><a href="https://twitter.com/UnlockProtocol" alt="Twitter">
        <FontAwesome.FaTwitter /> Follow us
      </a></li>
      <li><a href="https://github.com/unlock-protocol" alt="Source Code">
        <FontAwesome.FaGithub /> Source Code
      </a></li>
      <li><a href="https://t.me/unlockprotocol" alt="Telegram">
        <FontAwesome.FaPaperPlane /> Community
      </a></li>
    </ul>
  </footer>
)

export default Footer
