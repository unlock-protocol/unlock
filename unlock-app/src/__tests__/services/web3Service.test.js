import Web3Service from '../../services/web3Service'
import {setAccount} from '../../actions/accounts'
import nock from 'nock'

const defaultState = {
  network: {
    name: 'test',
    account: {
    },
  },
}

let rpcRequestId = 0

// net_version
const netVersionAndYield = (netVersion) => {
  rpcRequestId += 1
  nock('http://127.0.0.1:8545', { 'encodedQueryParams': true })
    .post('/', { 'jsonrpc': '2.0', 'id': rpcRequestId, 'method': 'net_version', 'params': [] })
    .reply(200, { 'id': rpcRequestId, 'jsonrpc': '2.0', 'result': netVersion }) //.log(console.log)
}

// eth_getBalance
const getBalanceForAccountAndYieldBalance = (account, balance) => {
  rpcRequestId += 1
  nock('http://127.0.0.1:8545', { 'encodedQueryParams': true })
    .post('/', { 'jsonrpc': '2.0', 'id': rpcRequestId, 'method': 'eth_getBalance', 'params': [account.toLowerCase(), 'latest'] })
    .reply(200, { 'id': rpcRequestId, 'jsonrpc': '2.0', 'result': balance }) //.log(console.log)
}

// eth_accounts
const accountsAndYield = (accounts) => {
  rpcRequestId += 1
  nock('http://127.0.0.1:8545', { 'encodedQueryParams': true })
    .post('/', { 'jsonrpc': '2.0', 'id': rpcRequestId, 'method': 'eth_accounts', 'params': [] })
    .reply(200, { 'id': rpcRequestId, 'jsonrpc': '2.0', 'result': accounts }) //.log(console.log)
}

const nockRequests = (requests) => {
  requests()
}

describe('Web3Service', () => {

  describe('handleTransaction', () => {
    it('should trigger transactionHash events')
    it('should trigger confirmation events')
    it('should trigger custom events when there are any')
  })

  describe('sendTransaction', () => {
    it('should handle cases where the private key is known')
    it('should handle cases where the private key is not known and using an extrenal provider')
  })

  describe('connect', () => {

    describe('when there is no account setup', () => {

      describe('when there is an account unlocked on the node', () => {
        it('should dispacth that account, after refreshing its balance', () => {
          const dispatch = jest.fn()
          const web3Service = new Web3Service(dispatch)

          const state = Object.assign({}, defaultState)
          state.network.account.address = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'

          netVersionAndYield(1337)
          getBalanceForAccountAndYieldBalance(state.network.account.address, '0xdeadbeef')

          return web3Service.connect(state).then(() => {
            const action = setAccount({
              address: state.network.account.address,
              balance: '3735928559',
            })
            expect(dispatch).toHaveBeenCalledWith(action)
          })
        })
      })

      describe('when there is no account unlocked on the node', () => {
        it('should create an account and dispatch it with a balance 0', () => {
          const dispatch = jest.fn()
          const web3Service = new Web3Service(dispatch)

          const state = Object.assign({}, defaultState)
          state.network.account = {}

          const newAccount = {
            address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
          }

          web3Service.createAccount = jest.fn( () => {
            return Promise.resolve(newAccount)
          })

          netVersionAndYield(1337)
          accountsAndYield([])
          getBalanceForAccountAndYieldBalance(newAccount.address, '0x0')

          return web3Service.connect(state).then(() => {
            const action = setAccount({
              address: newAccount.address,
              balance: '0',
            })
            expect(dispatch).toHaveBeenCalledWith(action)
          })

        })
      })
    })

    describe('when there is an account unlocked on the node', () => {
      it('should refresh that account\'s balance and dispatch it', () => {
        const dispatch = jest.fn()
        const web3Service = new Web3Service(dispatch)

        const state = Object.assign({}, defaultState)
        state.network.account = {}

        const nodeAccountAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'

        netVersionAndYield(1337)
        accountsAndYield([nodeAccountAddress])
        getBalanceForAccountAndYieldBalance(nodeAccountAddress, '0x0')

        return web3Service.connect(state).then(() => {
          const action = setAccount({
            address: nodeAccountAddress,
            balance: '0',
          })
          expect(dispatch).toHaveBeenCalledWith(action)
        })

      })
    })

    it.only('should get the network id', () => {
      const web3Service = new Web3Service(jest.fn())
      const nodeAccountAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
      const netVersion = Math.floor(Math.random(100000))

      netVersionAndYield(netVersion)
      accountsAndYield([nodeAccountAddress])
      getBalanceForAccountAndYieldBalance(nodeAccountAddress, '0x0')

      return web3Service.connect(Object.assign({}, defaultState)).then(() => {
        expect(web3Service.networkId).toEqual(netVersion)
      })

    })

  })

  describe('once initialized', () => {
    describe('createLock', () => {
      it('should create a new lock with the params provided')
      it('should dispatch setLock once it has been successfuly created')
      it('should handle failures if the lock could not be created')
    })

    describe('getLock', () => {
      it('should dispatch setLock once the lock has been loaded')
      it('should dispatch setLock with the right properties')
      it('should dispatch resetLock once the properties have been reloaded')
      it('should handle failures')
    })

    describe('purchaseKey', () => {

    })

    describe('getKey', () => {

    })

  })

})
