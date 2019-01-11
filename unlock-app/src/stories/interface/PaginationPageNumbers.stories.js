import React from 'react'
import { storiesOf } from '@storybook/react'
import { Provider } from 'react-redux'
import PageNumbers from '../../components/interface/pagination/PageNumbers'
import createUnlockStore from '../../createUnlockStore'

const store = createUnlockStore({
  transactions: {
    deployedid: {
      status: 'mined',
      confirmations: 24,
    },
    confirmingid: {
      status: 'mined',
      confirmations: 4,
    },
    submittedid: {
      status: 'submitted',
      confirmations: 0,
    },
    withdrawalconfirmingid: {
      status: 'mined',
      confirmations: 2,
      withdrawal: 'withdrawalconfirmingaddress',
    },
    withdrawalsubmittedid: {
      status: 'submitted',
      confirmations: 0,
      withdrawal: 'withdrawalsubmittedaddress',
    },
  },
  keys: {
    keyid: {
      transaction: '0x23749328748932748932473298473289473298',
      lock: '0xab7c74abc0c4d48d1bdad5dcb26153fc8780f83e',
      expiration:
        Math.floor(new Date('Jan 8, 2019 00:00:00').getTime() / 1000) +
        86400 * 30, // 30 days from right now
      data: 'ben@unlock-protocol.com',
    },
  },
  currency: {
    USD: 195.99,
  },
})

storiesOf('PaginationPageNumbers', module)
  .addDecorator(getStory => <Provider store={store}>{getStory()}</Provider>)
  .add('5 Pages', () => {
    return <PageNumbers numberOfPages={5} currentPage={1} />
  })
  .add('10 Pages', () => {
    return <PageNumbers numberOfPages={10} currentPage={1} />
  })
  .add('20 Pages', () => {
    return <PageNumbers numberOfPages={20} currentPage={1} />
  })
  .add('20 Pages with current page 6th', () => {
    return <PageNumbers numberOfPages={20} currentPage={6} />
  })
  .add('20 Pages with current page 8th', () => {
    return <PageNumbers numberOfPages={20} currentPage={8} />
  })
  .add('20 Pages with current page 10th', () => {
    return <PageNumbers numberOfPages={20} currentPage={10} />
  })
  .add('20 Pages with current page 12th', () => {
    return <PageNumbers numberOfPages={20} currentPage={12} />
  })
  .add('20 Pages with current page 15th', () => {
    return <PageNumbers numberOfPages={20} currentPage={15} />
  })
  .add('20 Pages with current page 20th', () => {
    return <PageNumbers numberOfPages={20} currentPage={20} />
  })
