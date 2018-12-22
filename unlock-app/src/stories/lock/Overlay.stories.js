import { Provider } from 'react-redux'
import React from 'react'
import { storiesOf } from '@storybook/react'
import { Overlay } from '../../components/lock/Overlay'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  currency: {
    USD: 195.99,
  },
})

const render = locks => (
  <section>
    <h1>HTML Ipsum Presents</h1>

    <p>
      <strong>Pellentesque habitant morbi tristique</strong>
      {' '}
senectus et netus
      et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
      vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet
      quam egestas semper.
      <em>Aenean ultricies mi vitae est.</em>
      {' '}
Mauris placerat eleifend leo.
      Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi,
      condimentum sed,
      <code>commodo vitae</code>
, ornare sit amet, wisi. Aenean fermentum, elit
      eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus
      enim ac dui.
      <a href=".">Donec non enim</a>
      {' '}
in turpis pulvinar facilisis. Ut felis.
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

    <Overlay locks={locks} hideModal={() => {}} showModal={() => {}} />
  </section>
)

storiesOf('Overlay', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('with a single Lock', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '123400000000000000',
        fiatPrice: '20',
      },
    ]
    return render(locks)
  })
  .add('with multiple locks', () => {
    const locks = [
      {
        name: 'One Month',
        keyPrice: '10000000000000000',
        fiatPrice: '20.54',
      },
      {
        name: 'One Year',
        keyPrice: '100000000000000000',
        fiatPrice: '200.27',
      },
    ]
    return render(locks)
  })
