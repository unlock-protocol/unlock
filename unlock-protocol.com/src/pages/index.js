import React from 'react'
import Link from 'gatsby-link'

import Button from '../components/Button'
import Buttons from '../components/Buttons'
import Column from '../components/Column'
import Columns from '../components/Columns'
import OptinForm from '../components/OptinForm'
import * as FontAwesome from 'react-icons/lib/fa'

const IndexPage = () => (
  <section className="page__right">
    <div className="page__description">
      <p>
        Unlock is an <i>access control protocol</i> built on a blockchain. It enables creators to monetize their content or software without relying on a middleman. It lets consumers manage all of their subscriptions in a consistent way, as well as earn discounts when they share the best content and applications they use.
      </p>
      <Buttons>
        <Button className="button--default" href="https://medium.com/@julien51/its-time-to-unlock-the-web-b98e9b94add1" text="Learn more..." />
        <Button className="button--default" href="https://github.com/unlock-protocol" text="Source Code">
          <FontAwesome.FaGithub />
        </Button>
        <Button className="button--default" href="https://t.me/unlockprotocol" text="Telegram">
          <FontAwesome.FaPaperPlane />
        </Button>
      </Buttons>
    </div>

    <div className="page__form">
      <OptinForm />
    </div>
  </section>
)

export default IndexPage
