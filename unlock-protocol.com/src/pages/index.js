import React from 'react'
import Link from 'gatsby-link'
import OptinForm from '../components/OptinForm'

const IndexPage = () => (
  <section className="page__right">
    <div className="page__description">
      <p>Unlock lets creators sell access to their creations. The price, scope and other terms are set by the creators themselves and the transactions happen on the blockchain, without middlemen.</p>
    </div>
    <div className="page__form">
      <OptinForm />
    </div>
  </section>
)

export default IndexPage
