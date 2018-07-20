import React from 'react'
import Link from 'gatsby-link'
import logo from './../assets/images/logo.svg'

const Header = ({ siteTitle }) => (
  <section className="page__left">
    <a href="/">
      <img src={logo} alt={siteTitle} className="logo" />
    </a>
  </section>
)

export default Header
