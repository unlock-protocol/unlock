import React from 'react'
import Link from 'gatsby-link'
import OptinForm from '../components/OptinForm'

const IndexPage = () => (
  <section className="page__right">
    <div className="page__description">
      <p>Tempor incididunt, onsectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. <br /><br /> Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
    </div>
    <div className="page__form">
      <OptinForm />
    </div>
  </section>
)

export default IndexPage
