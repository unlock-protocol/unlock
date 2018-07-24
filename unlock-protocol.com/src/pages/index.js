import React from 'react'
import Link from 'gatsby-link'

import Button from '../components/Button'
import Buttons from '../components/Buttons'
import Column from '../components/Column'
import Columns from '../components/Columns'
import OptinForm from '../components/OptinForm'
import * as FontAwesome from 'react-icons/lib/fa'

const IndexPage = () => (
    <div className="page__description">
      <p className="page__hero" >
        Unlock is an <strong>access control protocol</strong> built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.
      </p>
      <Buttons>
        <Button className="button--default" href="/about" text="Learn more..." />
        <Button className="button--default" href="/jobs" text="Join us!" />
      </Buttons>
      <div className="page__form">
        <OptinForm />
      </div>
    </div>

)

export default IndexPage
