import React from 'react'
import { Provider } from 'react-redux'
import { storiesOf } from '@storybook/react'
import OptimisticOverlay from '../../components/paywall/OptimisticOverlay'
import FakeIframe from '../../utils/FakeIframe'
import createUnlockStore from '../../createUnlockStore'

const render = (
  transaction,
  locks,
  keyStatus,
  optimism = { current: 1, past: 0 }
) => (
  <section>
    <h1>HTML Ipsum Presents</h1>

    <p>
      <strong>Pellentesque habitant morbi tristique</strong> senectus et netus
      et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
      vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet
      quam egestas semper.
      <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo.
      Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
      condimentum sed,
      <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit
      eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus
      enim ac dui.
      <a href=".">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.
    </p>

    <h2>Header Level 2</h2>

    <ol>
      <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
      <li>Aliquam tincidunt mauris eu risus.</li>
    </ol>

    <blockquote>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna.
        Cras in mi at felis aliquet congue. Ut a est eget ligula molestie
        gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis,
        tellus est malesuada tellus, at luctus turpis elit sit amet quam.
        Vivamus pretium ornare est.
      </p>
    </blockquote>

    <h3>Header Level 3</h3>

    <ul>
      <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
      <li>Aliquam tincidunt mauris eu risus.</li>
    </ul>

    <FakeIframe hide={false}>
      <OptimisticOverlay
        locks={locks}
        hideModal={() => {}}
        requiredConfirmations={6}
        optimism={optimism}
        keyStatus={keyStatus}
        transaction={transaction}
      />
    </FakeIframe>
  </section>
)

const transaction = {
  hash: 'transaction',
  status: 'mined',
  confirmations: 0,
  blockNumber: 1,
}

const lock = {
  address: 'lock',
  keyPrice: '0.01',
  expirationDuration: 1234,
  maxNumberOfKeys: -1,
  owner: 'account',
}

function getTransaction(overrides = {}) {
  return {
    ...transaction,
    ...overrides,
  }
}

const store = createUnlockStore()

storiesOf('Paywall/Optimistic Overlay', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('pending purchase', () => {
    return render(
      getTransaction({
        status: 'pending',
      }),
      [lock],
      'pending'
    )
  })
  .add('submitted purchase', () => {
    return render(
      getTransaction({
        status: 'submitted',
      }),
      [lock],
      'submitted'
    )
  })
  .add('some confirmations', () => {
    return render(
      getTransaction({
        status: 'mined',
        confirmations: 3,
      }),
      [lock],
      'confirming'
    )
  })
  .add('confirmed', () => {
    return render(
      getTransaction({
        status: 'mined',
        confirmations: 3,
      }),
      [lock],
      'valid'
    )
  })
  .add('while no key is purchased, displays nothing', () => {
    return render(getTransaction(), [lock], 'none')
  })
  .add('while key is expired, displays nothing', () => {
    return render(getTransaction(), [lock], 'expired')
  })
  .add('if pessimistic, displays nothing', () => {
    return render(getTransaction(), [lock], 'mined', { current: 0, past: 1 })
  })
