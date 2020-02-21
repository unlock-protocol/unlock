import { useReducer, useContext, useEffect } from 'react'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Balances } from '../unlockTypes'
import { Web3ServiceContext } from '../utils/withWeb3Service'

interface BalanceUpdate {
  // `eth` or the currency contract address
  kind: string
  value: string
}

const defaultBalances: Balances = {
  eth: '0',
}

const balanceReducer = (balances: Balances, update: BalanceUpdate) => {
  return {
    ...balances,
    [update.kind]: update.value,
  }
}

export const useGetTokenBalance = (accountAddress: string) => {
  const web3Service: Web3Service = useContext(Web3ServiceContext)
  const [balances, updateBalance] = useReducer(balanceReducer, defaultBalances)

  async function getTokenBalance(contractAddress: string) {
    const value = await web3Service.getTokenBalance(
      contractAddress,
      accountAddress
    )
    updateBalance({ kind: contractAddress, value })
  }

  async function getEthBalance() {
    const value = await web3Service.refreshAccountBalance({
      address: accountAddress,
    })
    updateBalance({ kind: 'eth', value })
  }

  // Always get eth balance to begin with
  useEffect(() => {
    getEthBalance()
  }, [])

  return { balances, getTokenBalance }
}
