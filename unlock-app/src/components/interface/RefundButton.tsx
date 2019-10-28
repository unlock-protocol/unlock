import React from 'react'
import { ethers } from 'ethers'

interface RefundButtonProps {
  externalRefundContractAddress: string
  accountAddress: string
  provider: any
}
interface RefundButtonState {
  refundInitiated: boolean
}
export default class RefundButton extends React.Component<
  RefundButtonProps,
  RefundButtonState
> {
  private contract: ethers.Contract
  constructor(props: RefundButtonProps) {
    super(props)
    const { provider, externalRefundContractAddress } = props
    const web3Provider = new ethers.providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const abi = ['function refund(address recipient)']
    this.contract = new ethers.Contract(
      externalRefundContractAddress,
      abi,
      signer
    )

    this.state = {
      refundInitiated: false,
    }
  }

  initiateRefund = async () => {
    const { accountAddress } = this.props
    await this.contract.refund(accountAddress)
    this.setState({
      refundInitiated: true,
    })
  }

  render() {
    const { refundInitiated } = this.state
    if (refundInitiated) {
      return (
        <button type="button" disabled>
          Refund Initiated
        </button>
      )
    }
    return (
      <button type="button" onClick={this.initiateRefund}>
        Perform refund
      </button>
    )
  }
}
