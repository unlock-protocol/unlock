import React from 'react'
import Link from 'gatsby-link'

import Button from '../components/Button'
import Column from '../components/Column'
import Columns from '../components/Columns'
import OptinForm from '../components/OptinForm'

const ElementsPage = () => (
    <div className="page__description">
      <p>I am a generic Paragraph, followed by three types of buttons.</p>

      <h2 className="h">Buttons</h2>
      <p>
        <Button className="button--action" href="#" text="button--action" />&nbsp;
        <Button className="button--default" href="#" text="button--default" />&nbsp;
        <Button className="button--link" href="#" text="button--link" />
      </p>

      <h2 className="h">Columns</h2>
      <Columns>
        <Column>
          <p>This is a column about Unlock</p>
        </Column>
        <Column>
          <p>This is a column about Unlock</p>
        </Column>
        <Column>
          <p>This is a column about Unlock</p>
        </Column>
      </Columns>

      <h1 className="h">These are headings</h1>
      <h2 className="h">These are headings</h2>
      <h3 className="h">These are headings</h3>
      <h4 className="h">These are headings</h4>
      <h5 className="h">These are headings</h5>
      <h6 className="h">These are headings</h6>

      <h1 className="h h--alt">These are headings</h1>
      <h2 className="h h--alt">These are headings</h2>
      <h3 className="h h--alt">These are headings</h3>
      <h4 className="h h--alt">These are headings</h4>
      <h5 className="h h--alt">These are headings</h5>
      <h6 className="h h--alt">These are headings</h6>

      <div className="page__form">
        <h2 className="h">Optin Form</h2>
        <OptinForm />
      </div>
    </div>

)

export default ElementsPage
