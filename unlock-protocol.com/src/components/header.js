import React from 'react'
import Link from 'gatsby-link'
import logo from './../assets/images/logo.svg'

const Header = ({ siteTitle }) => (
  <section className="page__left">
    <img src={logo} alt={siteTitle} className="logo" />
  </section>
)

export default Header
