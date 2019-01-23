import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

import BrowserOnly from '../../../helpers/BrowserOnly'
import { ActionButton } from '../../../creator/CreatorLocks'

export class HomepageButton extends React.Component {
  constructor(props, context) {
    super(props, context)
    const { acceptedTerms } = this.props
    this.state = {
      acceptedTerms: acceptedTerms,
    }
    this.acceptTerms = this.acceptTerms.bind(this)
  }

  acceptTerms() {
    this.setState(() => ({
      acceptedTerms: true,
    }))
  }

  render() {
    const { env } = this.props
    const { acceptedTerms } = this.state

    return (
      <>
        {acceptedTerms === true && (
          <Action>
            {env !== 'prod' && (
              <Link href="/dashboard">
                <a>
                  <DashboardButton>Go to Your Dashboard</DashboardButton>
                </a>
              </Link>
            )}

            {env === 'prod' && (
              <DashboardButton disabled>Dashboard coming soon</DashboardButton>
            )}

            <ButtonLabel>
              Requires a browser with an Ethereum wallet
            </ButtonLabel>
          </Action>
        )}
        {acceptedTerms !== true && (
          <TermsBox>
            <div>
              To access the dashboard you need to agree to our&nbsp;
              <Link href="/terms">
                <a>Terms of Service</a>
              </Link>
              &nbsp; and&nbsp;
              <Link href="/privacy">
                <a>Privacy Policy</a>
              </Link>
            </div>
            <BrowserOnly>
              <ActionButton onClick={this.acceptTerms}>I Agree</ActionButton>
            </BrowserOnly>
          </TermsBox>
        )}
      </>
    )
  }
}

const DashboardButton = styled(ActionButton)`
  max-width: 400px;
  padding: 20px 50px;
`

const TermsBox = styled.div`
  width: 568px;
  height: 72px;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-template-columns: 400px 120px;
  grid-gap: 16px;
  padding: 16px;
  font-family: IBM Plex Mono;
  font-size: 14px;
  margin: auto;
`

const Action = styled.div`
  display: grid;
  justify-items: center;
  grid-gap: 16px;
  margin-bottom: 50px;
`

const ButtonLabel = styled.small`
  font-size: 12px;
  font-weight: 200;
  font-family: 'IBM Plex Mono', 'Courier New', Serif;
  color: var(--darkgrey);
  display: grid;
  grid-row: 2;
  justify-content: center;
  text-align: center;
`

HomepageButton.propTypes = {
  env: PropTypes.string,
  acceptedTerms: PropTypes.bool,
}

HomepageButton.defaultProps = {
  env: 'dev',
  acceptedTerms: false,
}

export default HomepageButton
