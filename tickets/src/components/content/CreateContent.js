import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import React, { Component } from 'react'
import Head from 'next/head'
import Layout from '../interface/Layout'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import BrowserOnly from '../helpers/BrowserOnly'
import { pageTitle } from '../../constants'
import UnlockPropTypes from '../../propTypes'
import { addEvent, loadEvent } from '../../actions/event'
import withConfig from '../../utils/withConfig'
import CreateEventForm from './create/CreateEventForm'
import {
  Steps,
  Step,
  Fieldset,
  Field,
  CreateTitle,
  Label,
  StyledSelect,
  Text,
  Cta,
} from '../interface/EventStyles'

export class CreateContent extends Component {
  constructor(props) {
    super(props)
    this.lockChanged = this.lockChanged.bind(this)
    this.saveEvent = this.saveEvent.bind(this)
  }

  lockChanged(address) {
    const { loadEvent } = this.props
    loadEvent(address)
  }

  saveEvent(newEvent) {
    const { account, addEvent } = this.props
    addEvent({
      ...newEvent,
      owner: account.address,
    })
  }

  render() {
    const { locks, now, config, event, loading } = this.props

    const lockPlaceholder = loading ? 'Loading ...' : 'Choose a lock'

    return (
      <GlobalErrorConsumer>
        <BrowserOnly>
          <Layout title="Tickets" forContent>
            <Head>
              <title>{pageTitle('Create Ticket')}</title>
            </Head>
            <Steps>
              <Step>
                <CreateTitle>Select your Lock</CreateTitle>
                <Fieldset>
                  <Field>
                    <Label>Lock</Label>
                    <StyledSelect
                      placeholder={lockPlaceholder}
                      className="select-container"
                      classNamePrefix="select-option"
                      options={locks.map(savedLock => ({
                        value: savedLock.address,
                        label: savedLock.name || savedLock.address,
                      }))}
                      onChange={selectedOption => {
                        if (selectedOption.value)
                          this.lockChanged(selectedOption.value)
                      }}
                    />
                  </Field>
                  <Field>
                    <Label>&nbsp;</Label>
                    <Text>
                      Don’t have a lock? <br />
                      <Cta href={config.unlockAppUrl} target="_blank">
                        Create a new lock on unlock-protocol.com
                      </Cta>
                    </Text>
                  </Field>
                </Fieldset>
              </Step>
              <CreateEventForm
                key={event.lockAddress}
                event={event}
                saved={event.saved}
                now={now}
                save={this.saveEvent}
                disabled={!event.lockAddress}
              />
            </Steps>
          </Layout>
        </BrowserOnly>
      </GlobalErrorConsumer>
    )
  }
}

CreateContent.propTypes = {
  now: PropTypes.instanceOf(Date),
  account: UnlockPropTypes.account,
  addEvent: PropTypes.func.isRequired,
  loadEvent: PropTypes.func.isRequired,
  event: UnlockPropTypes.ticketedEvent,
  locks: PropTypes.arrayOf(UnlockPropTypes.lock),
  config: UnlockPropTypes.configuration.isRequired,
  loading: PropTypes.number.isRequired,
}

CreateContent.defaultProps = {
  locks: [],
  event: {},
  account: null,
  now: new Date(),
}

export const mapStateToProps = ({ locks, account, event, loading }) => {
  let selectLocks = Object.values(locks).filter(
    lock => lock.owner === account.address
  )

  return {
    locks: selectLocks,
    account,
    event,
    loading,
  }
}

export const mapDispatchToProps = dispatch => ({
  addEvent: event => dispatch(addEvent(event)),
  loadEvent: address => dispatch(loadEvent(address)),
})

export default withConfig(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CreateContent)
)
