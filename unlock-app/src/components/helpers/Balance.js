import styled from 'styled-components'
import React from 'react'
import PropTypes from 'prop-types'
import Web3Utils from 'web3-utils'
import Svg from '../interface/svg'

/**
 * Component which shows a balance in Eth
 * @param {*} amount: the amount to convert to Eth
 * @param {string} unit: the unit of the amount to convert to Eth
 */
export function Balance({ amount, unit = 'wei' }) {
  let inWei = Web3Utils.toWei(amount || '0', unit)
  let inEth = Web3Utils.fromWei(inWei, 'ether')
  return (<BalanceWithUnit>
    <Unit>
      <Svg.Eth width="1em" height="1em" />
    </Unit>
    <Amount>{inEth}</Amount>
  </BalanceWithUnit>)
}

Balance.propTypes = {
  amount: PropTypes.string,
  unit: PropTypes.string,
  symbol: PropTypes.bool,
}

export const BalanceWithUnit = styled.div`
  display: grid;
  align-content: stretch;
  grid-auto-flow: column;
`

const Amount = styled.span``

export const Unit = styled.span`
  display: grid;
  align-items: end;
`

export default Balance
