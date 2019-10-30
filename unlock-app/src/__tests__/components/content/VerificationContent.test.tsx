import React from 'react'
import * as rtl from '@testing-library/react'
import { Provider } from 'react-redux'
import { ConfigContext } from '../../../utils/withConfig'
import createUnlockStore from '../../../createUnlockStore'
import VerificationContent, {
  mapStateToProps,
} from '../../../components/content/VerificationContent'

function renderPage(storeValues?: { [key: string]: any }) {
  return rtl.render(
    <Provider store={createUnlockStore(storeValues || {})}>
      <ConfigContext.Provider value={{}}>
        <VerificationContent />
      </ConfigContext.Provider>
    </Provider>
  )
}

const account = {
  address: '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2',
}
const network = {
  name: 1,
}
const routerWithoutSearch = {
  location: {
    search: '',
  },
}
const routerWithSearch = {
  location: {
    search:
      '?data=%257B%2522accountAddress%2522%253A%25220xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2%2522%252C%2522lockAddress%2522%253A%25220xd9b3865d630941c54b6aa263a4dd4b8e66ab3c5c%2522%252C%2522timestamp%2522%253A1571854695914%257D&sig=MHgxN2VhODkzOWVkYTgwZjA3ZDBkZDk3YjA1MjhkNGIxMDViNzliMDNlYzU4MjI2YWVjYjljY2ZlZDIzOTI4YTBlMDU0OGJiYmE0ZDdlN2RiNjhjYzc4ZWNlYjYxMWE4OTc4ZDgzMWVmODRkZWViNzEzMjlhZTMwNGE0ODc1YjdhNDFi',
  },
}

describe('VerificationContent', () => {
  describe('render', () => {
    it('should be a page with the title "Verification"', () => {
      expect.assertions(0)
      const { getByText } = renderPage()

      getByText('Verification')
    })

    it('should show the account when there is an account in state', () => {
      expect.assertions(0)
      const { getByText } = renderPage({
        account: {
          address: '0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE',
        },
      })

      getByText('0xD6858301c9F434cCcDbFaB8E984bea08BbDBFDCE')
    })
  })

  describe('mapStateToProps', () => {
    it('should pass through account and network', () => {
      expect.assertions(1)

      expect(
        mapStateToProps({
          account: account as any,
          network: network as any,
          router: routerWithoutSearch as any,
        })
      ).toEqual({
        account,
        network,
      })
    })

    it('should process the query string, if present', () => {
      expect.assertions(1)

      expect(
        mapStateToProps({
          account: account as any,
          network: network as any,
          router: routerWithSearch as any,
        })
      ).toEqual({
        account,
        network,
        data: {
          accountAddress: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
          lockAddress: '0xd9b3865d630941c54b6aa263a4dd4b8e66ab3c5c',
          timestamp: 1571854695914,
        },
        hexData:
          '0x7b226163636f756e7441646472657373223a22307861616164656564346330623836316362333666346365303036613963393062613265343366646332222c226c6f636b41646472657373223a22307864396233383635643633303934316335346236616132363361346464346238653636616233633563222c2274696d657374616d70223a313537313835343639353931347d',
        sig:
          '0x17ea8939eda80f07d0dd97b0528d4b105b79b03ec58226aecb9ccfed23928a0e0548bbba4d7e7db68cc78eceb611a8978d831ef84deeb71329ae304a4875b7a41b',
      })
    })
  })
})
