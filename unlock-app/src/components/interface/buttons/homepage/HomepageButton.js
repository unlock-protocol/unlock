import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'

import { ActionButton } from '../ActionButton'
import withConfig from '../../../../utils/withConfig'
import UnlockPropTypes from '../../../../propTypes'

export class HomepageButton extends React.Component {
  constructor(props) {
    super(props)
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
    const { acceptedTerms } = this.state
    const { config } = this.props

    return (
      <>
        {acceptedTerms !== true && (
          <Action>
            <DashboardButton onClick={this.acceptTerms}>
              Go to Your Dashboard
            </DashboardButton>

            <ButtonLabel>
              Requires a browser with an Ethereum wallet
            </ButtonLabel>
          </Action>
        )}
        {acceptedTerms === true && (
          <TermsBox>
            <div>
              To access the dashboard you need to agree to our&nbsp;
              <Link href={config.unlockStaticUrl + '/terms'}>
                <a>Terms of Service</a>
              </Link>
              &nbsp; and&nbsp;
              <Link href={config.unlockStaticUrl + '/privacy'}>
                <a>Privacy Policy</a>
              </Link>
            </div>
            <Link href="/dashboard">
              <a>
                <TermsButton>I Agree</TermsButton>
              </a>
            </Link>
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

const TermsButton = styled(ActionButton)`
  width: 100%;
  height: 100%;
`

const TermsBox = styled.div`
  max-width: 540px;
  min-height: 72px;
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: grid;
  grid-template-columns: 3fr 1fr;
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
  acceptedTerms: PropTypes.bool,
  config: UnlockPropTypes.configuration.isRequired,
}

HomepageButton.defaultProps = {
  acceptedTerms: false,
}

export default withConfig(HomepageButton)
