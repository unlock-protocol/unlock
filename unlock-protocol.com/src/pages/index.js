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
      <div className="page__hero" >
        <p>
          Unlock is an <strong>access control protocol</strong> that enables creators to monetize
          their work directly - without relying on a middleman.
        </p>
        <p>
          Consumers manage all of their subscriptions
          in a consistent way, as well as earn discounts when they share the best content and applications they use.
          It's all built on a blockchain, so it's decentralized and free to use forever.
        </p>
      </div>
      <Buttons>
        <Button className="button--default" href="/about" text="Learn more" />
        <Button className="button--default" href="/jobs" text="We're hiring!" />
      </Buttons>
      <div className="page__form">
        <OptinForm />
      </div>
    </div>

)

export default IndexPage
